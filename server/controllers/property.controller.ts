import { Request, Response } from 'express';
import { db } from '../database';
import { propertyConfig, PropertyStatus, PropertyType } from '../config/property.config';
import { AppError } from '../middleware/error.middleware';

// Interface pour le type Property
export interface Property {
  id?: number;
  owner_id: number;
  title: string;
  description?: string;
  type: string;
  status: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  area: number;
  rooms: number;
  bathrooms: number;
  floor: string;
  furnished: boolean;
  equipment: string[];
  has_elevator: boolean;
  has_parking: boolean;
  has_balcony: boolean;
  has_terrace: boolean;
  has_garden: boolean;
  has_pool: boolean;
  has_air_conditioning: boolean;
  has_heating: boolean;
  rent?: number;
  charges: number;
  deposit?: number;
  currency: string;
  year_built?: number;
  is_featured: boolean;
  available_from?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Créer une nouvelle propriété
export const createProperty = async (req: Request, res: Response) => {
  // Vérifier d'abord la connexion à la base de données
  try {
    // Tester la connexion
    await db.raw('SELECT 1');
    console.log('✅ Connexion à la base de données établie avec succès');
    
    // Vérifier si on peut lire les propriétés existantes
    const existingProperties = await db('properties').select('*').limit(5);
    console.log(`✅ ${existingProperties.length} propriétés trouvées dans la base de données`);
    if (existingProperties.length > 0) {
      console.log('Exemple de propriété existante:', {
        id: existingProperties[0].id,
        title: existingProperties[0].title,
        type: existingProperties[0].type,
        status: existingProperties[0].status
      });
    }
  } catch (dbError) {
    console.error('❌ Erreur de connexion à la base de données:', dbError);
    res.status(500).json({
      success: false,
      message: 'Impossible de se connecter à la base de données',
      error: process.env.NODE_ENV === 'development' ? (dbError instanceof Error ? dbError.message : String(dbError)) : undefined
    });
  }

  // Démarrer une transaction
  const trx = await db.transaction();
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Non autorisé' 
      });
    }

    const {
      title, description, type = propertyConfig.defaults.type,
      status = propertyConfig.defaults.status as PropertyStatus,
      address, // This is now an object
      area, 
      rooms = propertyConfig.defaults.rooms, 
      bathrooms = propertyConfig.defaults.bathrooms, 
      floor = propertyConfig.defaults.floor,
      furnished = propertyConfig.defaults.furnished, 
      equipment = propertyConfig.defaults.equipment, 
      has_elevator = propertyConfig.defaults.has_elevator,
      has_parking = propertyConfig.defaults.has_parking, 
      has_balcony = propertyConfig.defaults.has_balcony, 
      has_terrace = propertyConfig.defaults.has_terrace,
      has_garden = propertyConfig.defaults.has_garden, 
      has_pool = propertyConfig.defaults.has_pool, 
      has_air_conditioning = propertyConfig.defaults.has_air_conditioning,
      has_heating = propertyConfig.defaults.has_heating, 
      rent, 
      charges = propertyConfig.defaults.charges, 
      deposit,
      currency = propertyConfig.defaults.currency, 
      year_built, 
      is_featured = propertyConfig.defaults.is_featured, 
      available_from
    } = req.body;

    

    // La validation est gérée par le middleware validatePropertyData

    // Préparer les données de la propriété
    const propertyData: Record<string, any> = {
      owner_id: userId,
      title,
      description: description || '',
      type,
      status,
      address: address,
      area: area || 0,
      rooms: rooms || 1,
      bathrooms: bathrooms || 1,
      floor: floor || '0',
      furnished: Boolean(furnished),
      equipment: equipment ? JSON.stringify(equipment) : JSON.stringify([]),
      has_elevator: Boolean(has_elevator),
      has_parking: Boolean(has_parking),
      has_balcony: Boolean(has_balcony),
      has_terrace: Boolean(has_terrace),
      has_garden: Boolean(has_garden),
      has_pool: Boolean(has_pool),
      has_air_conditioning: Boolean(has_air_conditioning),
      has_heating: Boolean(has_heating),
      rent: Number(rent) || 0,
      charges: Number(charges) || 0,
      deposit: Number(deposit) || 0,
      currency: currency || 'EUR',
      year_built: year_built ? Number(year_built) : null,
      is_featured: is_featured || false,
      available_from: available_from || null,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Ne pas inclure les champs qui pourraient ne pas exister dans la base de données
    const fieldsToExclude = ['latitude', 'longitude'];
    fieldsToExclude.forEach(field => {
      if (field in propertyData) {
        delete propertyData[field];
      }
    });

    console.log('Tentative d\'insertion de la propriété:', JSON.stringify(propertyData, null, 2));

    // 1. Créer un nouvel objet sans les colonnes problématiques
    const insertData = { ...propertyData };
    delete insertData.latitude;
    delete insertData.longitude;

    // 2. Obtenir les colonnes et les valeurs pour le logging
    const columns = Object.keys(insertData);
    const values = Object.values(insertData);
    
    console.log('Colonnes pour l\'insertion:', columns);
    console.log('Valeurs pour l\'insertion:', values);
    
    // 3. Construire la requête manuellement avec les colonnes exactes
    const columnList = columns.join('`, `');
    const placeholders = columns.map(() => '?').join(', ');
    
    // 4. Exécuter l'insertion avec Knex pour une meilleure gestion du retour
    const [propertyId] = await trx('properties')
      .insert(insertData)
      .returning('id');
      
    console.log('Résultat de l\'insertion:', propertyId);
    
    if (!propertyId) {
      // Essayer de récupérer le dernier ID inséré
      const lastInsert = await trx.raw('SELECT last_insert_rowid() as id');
      const lastId = lastInsert?.[0]?.id;
      
      if (!lastId) {
        throw new Error('Impossible de récupérer l\'ID de la propriété insérée');
      }
      
      console.log('ID récupéré via last_insert_rowid:', lastId);
      return lastId;
    }
    console.log('ID de propriété créée:', propertyId);

    // 6. Valider d'abord la transaction
    await trx.commit();
    console.log('Transaction validée avec succès');
    
    // 7. Récupérer la propriété créée avec tous les champs
    console.log('Récupération de la propriété créée...');
    
    // Fonction pour récupérer une propriété par son ID avec tous les champs
    const fetchProperty = async (id: number) => {
      console.log(`Tentative de récupération de la propriété ID: ${id}`);
      
      // Récupérer d'abord la structure de la table
      const tableInfo = await db.raw('PRAGMA table_info(properties)');
      console.log('Structure de la table properties:', tableInfo);
      
      // Récupérer la propriété avec tous les champs
      const result = await db.raw('SELECT * FROM properties WHERE id = ?', [id]);
      console.log('Résultat brut de la requête:', JSON.stringify(result, null, 2));
      
      // Essayer différents formats de réponse
      let property = null;
      if (result?.[0]?.[0]) {
        property = result[0][0];
      } else if (result?.[0]) {
        property = result[0];
      } else if (result) {
        property = result;
      }
      
      if (property) {
        console.log('Propriété récupérée avec succès:', JSON.stringify(property, null, 2));
      } else {
        console.log('Aucune propriété trouvée avec cet ID');
      }
      
      return property;
    };
    
    // Récupérer la propriété
    const propertyIdValue = propertyId.id || propertyId;
    console.log(`ID de propriété à récupérer: ${propertyIdValue}`);
    
    // Essayer plusieurs fois de récupérer la propriété
    let property = null;
    const maxRetries = 3;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        property = await fetchProperty(propertyIdValue);
        if (property) break;
        
        if (i < maxRetries - 1) {
          console.log(`Tentative ${i + 1} échouée, nouvelle tentative dans 200ms...`);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`Erreur lors de la tentative ${i + 1}:`, error);
        if (i === maxRetries - 1) throw error;
      }
    }
    
    if (!property) {
      // Dernier recours : essayer avec une requête directe sans transaction
      try {
        console.log('Dernière tentative avec une requête directe...');
        const directResult = await db.raw('SELECT * FROM properties WHERE id = ?', [propertyIdValue]);
        console.log('Résultat direct:', directResult);
        
        if (directResult?.[0]?.[0]) {
          property = directResult[0][0];
        } else if (directResult?.[0]) {
          property = directResult[0];
        }
        
        if (!property) {
          throw new Error(`Impossible de récupérer la propriété après ${maxRetries} tentatives`);
        }
      } catch (error) {
        console.error('Échec de la récupération directe:', error);
        throw new Error(`La propriété a été créée mais n'a pas pu être récupérée: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Fonction pour valider et parser les données de la propriété
    const processProperty = (property: any) => {
      if (!property) return null;
      
      // Convertir les champs booléens de SQLite (0/1) en boolean
      const booleanFields = [
        'furnished', 'has_elevator', 'has_parking', 'has_balcony',
        'has_terrace', 'has_garden', 'has_pool', 'has_air_conditioning',
        'has_heating', 'is_active', 'is_featured'
      ];
      
      const processed = { ...property };
      
      // Convertir les champs booléens
      booleanFields.forEach(field => {
        if (processed[field] !== undefined && processed[field] !== null) {
          processed[field] = Boolean(processed[field]);
        }
      });
      
      // Parser le champ equipment si c'est une chaîne JSON
      if (typeof processed.equipment === 'string') {
        try {
          processed.equipment = JSON.parse(processed.equipment);
        } catch (e) {
          console.warn('Erreur lors du parsing des équipements:', e);
          processed.equipment = [];
        }
      }
      
      // Convertir les dates si nécessaire
      if (processed.available_from && typeof processed.available_from === 'number') {
        processed.available_from = new Date(processed.available_from);
      }
      
      return processed;
    };
    
    // Traiter la propriété récupérée
    const processedProperty = processProperty(property);
    
    console.log('Propriété traitée avec succès:', JSON.stringify(processedProperty, null, 2));
    
    // Répondre avec succès
    return res.status(201).json({
      success: true,
      data: processedProperty
    });

  } catch (error) {
    // En cas d'erreur, annuler la transaction
    if (trx) {
      await trx.rollback();
      console.error('Transaction annulée en raison d\'une erreur');
    }
    
    console.error('Erreur lors de la création de la propriété:', error);
    
    // Renvoyer une réponse d'erreur détaillée
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la propriété',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur inconnue lors de la création de la propriété'
      });
    }
  }
};

// Récupérer les propriétés de l'utilisateur connecté
export const getMyProperties = async (req: Request, res: Response) => {
  try {
    // L'ID de l'utilisateur est ajouté par le middleware d'authentification
    const userId = (req as any).user.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }
    
    // Récupérer les 5 propriétés les plus récentes de l'utilisateur
    const properties = await db('properties')
      .where('owner_id', userId)
      .orderBy('created_at', 'desc')
      .limit(5)
      .select('*');
    
    // Convertir les équipements de JSON en tableau
    const formattedProperties = properties.map(prop => ({
      ...prop,
      equipment: prop.equipment ? JSON.parse(prop.equipment) : []
    }));
    
    res.json({
      success: true,
      data: formattedProperties
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de vos propriétés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos propriétés',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};

// Récupérer toutes les propriétés
export const getProperties = async (req: Request, res: Response) => {
  try {
    const properties = await db('properties').select('*');
    
    // Convertir les équipements de JSON en tableau
    const formattedProperties = properties.map(prop => ({
      ...prop,
      equipment: prop.equipment ? JSON.parse(prop.equipment) : []
    }));
    
    res.json({
      success: true,
      data: formattedProperties
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des propriétés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des propriétés',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};

// Récupérer une propriété par son ID
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[CONTROLLER] Tentative de récupération de la propriété avec l'ID: ${id}`);
    const property = await db('properties').where({ id }).first();
    
    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Propriété non trouvée'
      });
    }

    console.log(`[CONTROLLER] Propriété trouvée: ${property.title}`);
    
    // Convertir les équipements de JSON en tableau
    const formattedProperty = {
      ...property,
      equipment: property.equipment ? JSON.parse(property.equipment) : []
    };
    
    res.json({
      success: true,
      data: formattedProperty
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la propriété:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la propriété',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};

// Mettre à jour une propriété
export const updateProperty = async (req: Request, res: Response) => {
  const trx = await db.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Non autorisé' 
      });
    }
    
    // Vérifier que la propriété existe et appartient à l'utilisateur
    const existingProperty = await trx('properties')
      .where({ id, owner_id: userId })
      .first();
      
    if (!existingProperty) {
      await trx.rollback();
      res.status(404).json({
        success: false,
        message: 'Propriété non trouvée ou accès non autorisé'
      });
    }
    
    const updates = { ...req.body };
    
    // Mettre à jour les champs modifiés
    if (updates.equipment && Array.isArray(updates.equipment)) {
      updates.equipment = JSON.stringify(updates.equipment);
    }
    
    updates.updated_at = new Date();
    
    await trx('properties')
      .where({ id })
      .update(updates);
    
    await trx.commit();
    
    res.json({
      success: true,
      message: 'Propriété mise à jour avec succès'
    });
    
  } catch (error) {
    await trx.rollback();
    console.error('Erreur lors de la mise à jour de la propriété:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la propriété',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};

// Supprimer une propriété
export const deleteProperty = async (req: Request, res: Response) => {
  const trx = await db.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Non autorisé' 
      });
    }
    
    // Vérifier que la propriété existe et appartient à l'utilisateur
    const property = await trx('properties')
      .where({ id, owner_id: userId })
      .first();
      
    if (!property) {
      await trx.rollback();
      res.status(404).json({
        success: false,
        message: 'Propriété non trouvée ou accès non autorisé'
      });
    }
    
    // Supprimer la propriété
    await trx('properties').where({ id }).delete();
    
    await trx.commit();
    
    res.json({
      success: true,
      message: 'Propriété supprimée avec succès'
    });
    
  } catch (error) {
    await trx.rollback();
    console.error('Erreur lors de la suppression de la propriété:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la propriété',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};
