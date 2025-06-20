import { Request, Response } from 'express';
import { db } from '../database';

// Fonction utilitaire de log améliorée
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [PropertyController] ${message}`, data || '');
};

// Surcharge pour gérer les appels avec l'objet Request
log.request = (req: Request, message: string, data: any = {}) => {
  const timestamp = new Date().toISOString();
  const requestId = req.headers['x-request-id'] || 'no-request-id';
  const userId = req.user?.id ? `user:${req.user.id}` : 'anonymous';
  
  const logData = {
    ...data,
    _meta: {
      timestamp,
      requestId,
      userId,
      path: req.path,
      method: req.method
    }
  };
  
  console.log(`[${timestamp}] [${requestId}] [PropertyController] [${req.method} ${req.path}] [${userId}] ${message}`, logData);
};

// Récupérer toutes les propriétés
export const getProperties = async (req: Request, res: Response) => {
  try {
    log.request(req, 'Début de la récupération des propriétés', {
      query: req.query,
      params: req.params,
      user: req.user ? { id: req.user.id, type: req.user.userType } : 'anonymous'
    });

    const properties = await db('properties').select('*');
    
    log.request(req, 'Propriétés récupérées avec succès', {
      count: properties.length,
      firstPropertyId: properties[0]?.id || 'none',
      sample: properties.length > 0 ? {
        id: properties[0].id,
        title: properties[0].title,
        status: properties[0].status
      } : 'no-properties'
    });
    
    res.json(properties);
  } catch (error) {
    log.request(req, 'Erreur lors de la récupération des propriétés', {
      error: error.message,
      stack: error.stack,
      query: req.query,
      params: req.params
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des propriétés',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      requestId: req.headers['x-request-id']
    });
  }
};

// Créer une nouvelle propriété
export const createProperty = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || 'no-request-id';
  let trx;
  let propertyId;
  
  try {
    // Vérifier que l'utilisateur est bien connecté
    if (!req.user?.id) {
      log.request(req, 'Tentative de création de propriété sans utilisateur connecté', {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé - Utilisateur non connecté',
        requestId
      });
    }
    
    log.request(req, 'Début de la création d\'une propriété', {
      body: {
        ...req.body,
        // Ne pas logger les champs potentiellement sensibles en production
        ...(process.env.NODE_ENV === 'production' ? {
          // Exemple: masquer les données sensibles
          password: req.body.password ? '***' : undefined,
          token: req.body.token ? '***' : undefined
        } : {})
      },
      user: {
        id: req.user.id,
        type: req.user.userType,
        email: req.user.email
      },
      headers: {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length']
      }
    });
    
    // Démarrer une transaction pour assurer l'intégrité des données
    trx = await db.transaction();
    log.request(req, 'Transaction de base de données démarrée', { transactionId: trx?.client?.id || 'unknown' });

    // Valider les données d'entrée
    const { 
      title, 
      price, 
      address = '', 
      city, 
      postal_code, 
      country = 'France',
      type,
      status,
      area,
      floorArea,
      landArea,
      rooms,
      bathrooms,
      floor,
      furnished,
      equipment,
      hasElevator,
      hasParking,
      hasBalcony,
      hasTerrace,
      hasGarden,
      hasPool,
      hasAirConditioning,
      hasHeating,
      yearBuilt,
      rent,
      charges,
      deposit,
      currency,
      isFeatured,
      availableFrom
    } = req.body;
    
    // Validation basique des types (tous les champs sont optionnels)
    const fieldTypes = {
      // Informations de base
      type: 'string',
      status: 'string',
      area: 'number',
      floorArea: 'number',
      landArea: 'number',
      rooms: 'number',
      bathrooms: 'number',
      floor: ['string', 'number'],
      furnished: 'boolean',
      equipment: ['string', 'array'],
      address: 'string',
      
      // Caractéristiques
      hasElevator: 'boolean',
      hasParking: 'boolean',
      hasBalcony: 'boolean',
      hasTerrace: 'boolean',
      hasGarden: 'boolean',
      hasPool: 'boolean',
      hasAirConditioning: 'boolean',
      hasHeating: 'boolean',
      yearBuilt: 'number',
      
      // Informations financières
      rent: 'number',
      charges: 'number',
      deposit: 'number',
      currency: 'string',
      isFeatured: 'boolean',
      availableFrom: 'string'
    };

    const validationErrors: Record<string, string> = {};
    
    // Vérifier les types des champs fournis
    for (const [field, expectedType] of Object.entries(fieldTypes)) {
      const value = req.body[field];
      
      // Si le champ n'est pas fourni, on passe au suivant
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Vérifier le type
      const expectedTypes = Array.isArray(expectedType) ? expectedType : [expectedType];
      let actualType = typeof value;
      
      // Gestion spéciale pour les tableaux et les nombres
      if (Array.isArray(value)) {
        actualType = 'array';
      } else if (!isNaN(Number(value)) && value !== '') {
        actualType = 'number';
      }
      
      const isValidType = expectedTypes.some(t => {
        // Si le type attendu est 'number', on accepte les chaînes numériques
        if (t === 'number') return actualType === 'number' || !isNaN(Number(value));
        // Pour les booléens, on accepte true/false ou 'true'/'false'
        if (t === 'boolean') return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 0 || value === 1;
        // Pour les tableaux, on vérifie si c'est bien un tableau
        if (t === 'array') return Array.isArray(value) || (typeof value === 'string' && value.includes(','));
        // Pour les chaînes, on accepte n'importe quelle valeur non nulle
        if (t === 'string') return true;
        // Pour les autres types, on vérifie le type exact
        return actualType === t;
      });
      
      if (!isValidType) {
        validationErrors[field] = `Type invalide pour le champ ${field}. Attendu: ${expectedTypes.join(' ou ')}, Reçu: ${actualType} (${JSON.stringify(value)})`;
      }
    }
    
    // Si des erreurs de type, on les retourne
    if (Object.keys(validationErrors).length > 0) {
      log.request(req, 'Erreurs de type dans les données de la propriété', {
        validationErrors,
        receivedData: Object.keys(req.body)
      });
      
      return res.status(400).json({
        success: false,
        message: 'Erreur de type dans les données fournies',
        errors: validationErrors,
        requestId: req.headers['x-request-id']
      });
    }

    // Vérifier que l'utilisateur existe bien et est actif
    log.request(req, 'Vérification de l\'existence de l\'utilisateur', { userId: req.user.id });
    
    const userExists = await trx('users')
      .where('id', req.user.id)
      .andWhere('is_active', true)
      .first()
      .select(['id', 'email', 'user_type', 'is_active']);

    if (!userExists) {
      log.request(req, 'Échec de la création - Utilisateur non trouvé ou inactif', { 
        userId: req.user.id,
        userExists: !!userExists,
        isActive: userExists?.is_active
      });
      
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé ou compte désactivé',
        requestId: req.headers['x-request-id']
      });
    }
    
    log.request(req, 'Utilisateur vérifié avec succès', {
      userId: userExists.id,
      userType: userExists.user_type,
      isActive: userExists.is_active
    });

    // Préparer les données pour l'insertion avec des valeurs par défaut pour les champs optionnels
    log.request(req, 'Préparation des données de la propriété avec champs optionnels');
    
    // Fonction utilitaire pour convertir les valeurs booléennes
    const parseBool = (value: any): boolean | null => {
      if (value === undefined || value === null) return null;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return Boolean(value);
    };
    
    // Préparer l'objet de données avec des valeurs par défaut raisonnables
    const propertyData: Record<string, any> = {
      // Métadonnées système
      user_id: req.user.id,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
      
      // Champs de base
      type: type || 'T1',
      status: status || 'draft',
      area: !isNaN(parseFloat(area)) ? parseFloat(area) : null,
      floor_area: !isNaN(parseFloat(floorArea)) ? parseFloat(floorArea) : null,
      land_area: !isNaN(parseFloat(landArea)) ? parseFloat(landArea) : null,
      rooms: !isNaN(parseInt(rooms)) ? parseInt(rooms) : 1,
      bathrooms: !isNaN(parseInt(bathrooms)) ? parseInt(bathrooms) : 1,
      floor: floor !== undefined ? floor.toString() : '0',
      furnished: parseBool(furnished) || false,
      equipment: Array.isArray(equipment) ? equipment.join(',') : (equipment || ''),
      address: address || '',
      
      // Caractéristiques
      has_elevator: parseBool(hasElevator) || false,
      has_parking: parseBool(hasParking) || false,
      has_balcony: parseBool(hasBalcony) || false,
      has_terrace: parseBool(hasTerrace) || false,
      has_garden: parseBool(hasGarden) || false,
      has_pool: parseBool(hasPool) || false,
      has_air_conditioning: parseBool(hasAirConditioning) || false,
      has_heating: parseBool(hasHeating) || false,
      year_built: !isNaN(parseInt(yearBuilt)) ? parseInt(yearBuilt) : null,
      
      // Informations financières
      rent: !isNaN(parseFloat(rent)) ? parseFloat(rent) : 0,
      charges: !isNaN(parseFloat(charges)) ? parseFloat(charges) : 0,
      deposit: !isNaN(parseFloat(deposit)) ? parseFloat(deposit) : 0,
      currency: currency || 'EUR',
      is_featured: parseBool(isFeatured) || false,
      available_from: availableFrom ? new Date(availableFrom) : null
    };
    
    // Nettoyer l'objet pour ne garder que les champs définis (sauf les champs système)
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] === undefined || propertyData[key] === '') {
        delete propertyData[key];
      }
    });
    
    log.request(req, 'Données de la propriété préparées avec succès', {
      propertyData: {
        ...propertyData,
        // Ne pas logger les champs potentiellement volumineux
        description: propertyData.description ? `${propertyData.description.substring(0, 100)}...` : null,
        equipment: propertyData.equipment ? `${propertyData.equipment.substring(0, 100)}...` : null
      }
    });

    // Insérer la propriété dans la base de données
    log.request(req, 'Début de l\'insertion de la propriété dans la base de données');
    [propertyId] = await trx('properties').insert(propertyData);
    
    if (!propertyId) {
      throw new Error('Aucun ID de propriété retourné après insertion');
    }
    
    log.request(req, 'Propriété insérée avec succès', { propertyId });
    
    // Récupérer la propriété créée avec les informations de l'utilisateur
    log.request(req, 'Récupération des détails de la propriété créée', { propertyId });
    
    const newProperty = await trx('properties')
      .where('id', propertyId)
      .first()
      .select([
        'properties.*',
        db.raw('users.email as owner_email'),
        db.raw('users.first_name as owner_first_name'),
        db.raw('users.last_name as owner_last_name')
      ])
      .leftJoin('users', 'properties.user_id', 'users.id');
    
    if (!newProperty) {
      throw new Error(`Aucune propriété trouvée avec l'ID ${propertyId} après insertion`);
    }
    
    // Valider que tout s'est bien passé avant de committer
    log.request(req, 'Validation finale avant commit de la transaction');
    await trx.commit();
    
    const responseTime = Date.now() - startTime;
    log.request(req, 'Propriété créée avec succès', {
      propertyId,
      responseTime: `${responseTime}ms`,
      property: {
        id: newProperty.id,
        title: newProperty.title,
        status: newProperty.status,
        price: newProperty.price,
        rent: newProperty.rent,
      }
    });
    
    return res.status(201).json({
      success: true,
      message: 'Propriété créée avec succès',
      property: newProperty,
      requestId: req.headers['x-request-id']
    });
  } catch (error) {
    // Journalisation de l'erreur
    log.request(req, 'Erreur lors de la création de la propriété', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id
    });

    // Annulation de la transaction si elle existe
    if (trx) {
      try {
        await trx.rollback();
        log.request(req, 'Transaction annulée avec succès après erreur');
      } catch (rollbackError) {
        log.request(req, 'Erreur lors de l\'annulation de la transaction', {
          error: rollbackError.message,
          originalError: error.message
        });
      }
    }

    // Réponse d'erreur
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la création de la propriété',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      requestId: req.headers['x-request-id']
    });
  }
};

// Récupérer une propriété par son ID
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    log.request(req, `Récupération de la propriété avec l'ID: ${id}`);

    const property = await db('properties').where('id', id).first();

    if (!property) {
      log.request(req, `Propriété non trouvée avec l'ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Propriété non trouvée'
      });
    }

    log.request(req, `Propriété récupérée avec succès: ${id}`, { property });
    res.json(property);
  } catch (error) {
    log.request(req, 'Erreur lors de la récupération de la propriété', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la propriété',
      error: error.message
    });
  }
};

// Mettre à jour une propriété existante
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    log.request(req, `Mise à jour de la propriété avec l'ID: ${id}`, {
      body: req.body
    });

    // Vérifier que la propriété existe
    const existingProperty = await db('properties').where('id', id).first();
    if (!existingProperty) {
      log.request(req, `Tentative de mise à jour d'une propriété inexistante: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Propriété non trouvée'
      });
    }

    // Mettre à jour la propriété
    const [updatedProperty] = await db('properties')
      .where('id', id)
      .update({
        ...req.body,
        updated_at: db.fn.now()
      })
      .returning('*');

    log.request(req, `Propriété mise à jour avec succès: ${id}`, { updatedProperty });
    res.json(updatedProperty);
  } catch (error) {
    log.request(req, 'Erreur lors de la mise à jour de la propriété', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la propriété',
      error: error.message
    });
  }
};

// Supprimer une propriété
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    log.request(req, `Suppression de la propriété avec l'ID: ${id}`);

    // Vérifier que la propriété existe
    const existingProperty = await db('properties').where('id', id).first();
    if (!existingProperty) {
      log.request(req, `Tentative de suppression d'une propriété inexistante: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Propriété non trouvée'
      });
    }

    // Supprimer la propriété
    await db('properties').where('id', id).del();

    log.request(req, `Propriété supprimée avec succès: ${id}`);
    res.status(204).send();
  } catch (error) {
    log.request(req, 'Erreur lors de la suppression de la propriété', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la propriété',
      error: error.message
    });
  }
};

// Exporter toutes les méthodes du contrôleur
const PropertyController = {
  getProperties,
  createProperty,
  getPropertyById,
  updateProperty,
  deleteProperty
};

export default PropertyController;
