import { Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { AppError } from './error.middleware';
import { propertyConfig } from '../config/property.config';

// Vérifie si l'utilisateur est propriétaire de la propriété
export const isPropertyOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = parseInt(req.params.id, 10);
    const userId = req.user?.id;

    if (isNaN(propertyId)) {
      return next(new AppError('ID de propriété invalide', 400));
    }

    const property = await db('properties')
      .where({ id: propertyId })
      .first();

    if (!property) {
      return next(new AppError('Propriété non trouvée', 404));
    }

    // Vérifier si l'utilisateur est le propriétaire ou un administrateur
    if (property.owner_id !== userId && req.user?.userType !== 'ADMIN') {
      return next(new AppError('Non autorisé à accéder à cette propriété', 403));
    }

    // Ajouter la propriété à la requête pour une utilisation ultérieure
    req.property = property;
    next();
  } catch (error) {
    next(error);
  }
};

// Valide les données d'une propriété avant création ou mise à jour
export const validatePropertyData = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== DÉBUT VALIDATION DES DONNÉES ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.originalUrl);
  
  const propertyData = req.body;
  console.log('Données reçues:', JSON.stringify(propertyData, null, 2));
  
  const errors: Record<string, string> = {};

  // Vérification du titre
  console.log('\n=== VALIDATION DU TITRE ===');
  if (!propertyData.title || propertyData.title.trim() === '') {
    console.log('❌ Erreur: Le titre est obligatoire');
    errors.title = 'Le titre est obligatoire';
  } else {
    console.log('✅ Titre fourni:', propertyData.title);
    if (propertyData.title.length < propertyConfig.validation.title.minLength || 
        propertyData.title.length > propertyConfig.validation.title.maxLength) {
      const errorMsg = `Le titre doit contenir entre ${propertyConfig.validation.title.minLength} et ${propertyConfig.validation.title.maxLength} caractères`;
      console.log(`❌ Erreur: ${errorMsg} (actuel: ${propertyData.title.length} caractères)`);
      errors.title = errorMsg;
    } else {
      console.log('✅ Longueur du titre valide');
    }
  }

  // Vérification du type
  console.log('\n=== VALIDATION DU TYPE ===');
  if (!propertyData.type) {
    console.log('❌ Erreur: Le type est obligatoire');
    errors.type = 'Le type est obligatoire';
  } else if (!propertyConfig.propertyTypes.some(t => t.value === propertyData.type)) {
    console.log(`❌ Erreur: Type de propriété invalide: ${propertyData.type}`);
    errors.type = 'Type de propriété invalide';
  } else {
    console.log(`✅ Type valide: ${propertyData.type}`);
  }

  // Vérification de l'adresse
  console.log('\n=== VALIDATION DE L\'ADRESSE ===');
  if (!propertyData.address || propertyData.address.trim() === '') {
    console.log('❌ Erreur: L\'adresse est obligatoire');
    errors.address = 'L\'adresse est obligatoire';
  } else {
    console.log('✅ Adresse fournie');
  }

  // Vérification de la ville
  console.log('\n=== VALIDATION DE LA VILLE ===');
  if (!propertyData.city || propertyData.city.trim() === '') {
    console.log('❌ Erreur: La ville est obligatoire');
    errors.city = 'La ville est obligatoire';
  } else {
    console.log(`✅ Ville fournie: ${propertyData.city}`);
  }

  // Vérification du code postal
  console.log('\n=== VALIDATION DU CODE POSTAL ===');
  if (!propertyData.postal_code) {
    console.log('❌ Erreur: Le code postal est obligatoire');
    errors.postal_code = 'Le code postal est obligatoire';
  } else if (!/^\d{5}$/.test(propertyData.postal_code)) {
    console.log(`❌ Erreur: Code postal invalide: ${propertyData.postal_code}`);
    errors.postal_code = 'Code postal invalide (5 chiffres requis)';
  } else {
    console.log(`✅ Code postal valide: ${propertyData.postal_code}`);
  }

  // Vérification de la surface
  console.log('\n=== VALIDATION DE LA SURFACE ===');
  const area = parseFloat(propertyData.area);
  if (isNaN(area)) {
    console.log(`❌ Erreur: La surface doit être un nombre valide: ${propertyData.area}`);
    errors.area = 'La surface doit être un nombre valide';
  } else if (area < propertyConfig.validation.area.min || area > propertyConfig.validation.area.max) {
    const errorMsg = `La surface doit être comprise entre ${propertyConfig.validation.area.min} et ${propertyConfig.validation.area.max} m²`;
    console.log(`❌ Erreur: ${errorMsg} (reçu: ${area} m²)`);
    errors.area = errorMsg;
  } else {
    console.log(`✅ Surface valide: ${area} m²`);
  }

  // Vérification du loyer si fourni
  console.log('\n=== VALIDATION DU LOYER ===');
  if (propertyData.rent !== undefined) {
    const rent = parseFloat(propertyData.rent);
    const currency = propertyData.currency || 'EUR';
    
    if (isNaN(rent)) {
      console.log(`❌ Erreur: Le loyer doit être un nombre valide: ${propertyData.rent}`);
      errors.rent = 'Le loyer doit être un nombre valide';
    } else if (rent < propertyConfig.validation.rent.min || rent > propertyConfig.validation.rent.max) {
      const errorMsg = `Le loyer doit être compris entre ${propertyConfig.validation.rent.min} et ${propertyConfig.validation.rent.max} ${currency}`;
      console.log(`❌ Erreur: ${errorMsg} (reçu: ${rent} ${currency})`);
      errors.rent = errorMsg;
    } else {
      console.log(`✅ Loyer valide: ${rent} ${currency}`);
    }
  } else {
    console.log('ℹ️ Aucun loyer fourni, validation ignorée');
  }

  // Vérification des équipements
  console.log('\n=== VALIDATION DES ÉQUIPEMENTS ===');
  if (propertyData.equipment === undefined) {
    console.log('ℹ️ Aucun équipement fourni, utilisation d\'un tableau vide');
    propertyData.equipment = [];
  } else if (!Array.isArray(propertyData.equipment)) {
    console.log(`❌ Erreur: Les équipements doivent être fournis dans un tableau, reçu: ${typeof propertyData.equipment}`);
    errors.equipment = 'Les équipements doivent être fournis dans un tableau';
  } else {
    console.log(`Équipements fournis: ${JSON.stringify(propertyData.equipment)}`);
    
    const validEquipment = propertyConfig.equipment.map(e => e.value);
    const invalidEquipment = propertyData.equipment.filter(
      (eq: string) => !validEquipment.includes(eq)
    );
    
    if (invalidEquipment.length > 0) {
      const errorMsg = `Équipement(s) invalide(s): ${invalidEquipment.join(', ')}`;
      console.log(`❌ ${errorMsg}`);
      console.log(`   Équipements valides: ${validEquipment.join(', ')}`);
      errors.equipment = errorMsg;
    } else {
      console.log('✅ Tous les équipements sont valides');
    }
  }

  // Résumé de la validation
  console.log('\n=== RÉSUMÉ DE LA VALIDATION ===');
  
  if (Object.keys(errors).length > 0) {
    console.log('❌ Des erreurs de validation ont été trouvées:', errors);
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation des données',
      errors
    });
  }
  
  console.log('✅ Toutes les validations ont réussi');
  console.log('=== FIN DE LA VALIDATION ===\n');
  
  // Formater les données avant de les passer au contrôleur
  if (propertyData.equipment && Array.isArray(propertyData.equipment)) {
    propertyData.equipment = propertyData.equipment.filter(
      (eq: string) => propertyConfig.equipment.some(e => e.value === eq)
    );
  }

  // Convertir les champs numériques
  const numericFields = ['area', 'rooms', 'bathrooms', 'rent', 'charges', 'deposit', 'year_built'];
  numericFields.forEach(field => {
    if (propertyData[field] !== undefined) {
      propertyData[field] = parseFloat(propertyData[field]);
    }
  });

  // Convertir les champs booléens
  const booleanFields = [
    'furnished', 'has_elevator', 'has_parking', 'has_balcony', 
    'has_terrace', 'has_garden', 'has_pool', 'has_air_conditioning', 
    'has_heating', 'is_featured'
  ];
  booleanFields.forEach(field => {
    if (propertyData[field] !== undefined) {
      propertyData[field] = Boolean(propertyData[field]);
    }
  });

  next();
};

// Vérifie si la propriété existe et est accessible
export const propertyExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = parseInt(req.params.id, 10);

    if (isNaN(propertyId)) {
      return next(new AppError('ID de propriété invalide', 400));
    }

    const property = await db('properties')
      .where({ id: propertyId })
      .first();

    if (!property) {
      return next(new AppError('Propriété non trouvée', 404));
    }

    // Vérifier si la propriété est disponible (sauf pour les administrateurs)
    if (property.status !== 'DISPONIBLE' && 
        req.user?.userType !== 'ADMIN' && 
        property.owner_id !== req.user?.id) {
      return next(new AppError('Cette propriété n\'est pas disponible', 403));
    }

    // Ajouter la propriété à la requête pour une utilisation ultérieure
    req.property = property;
    next();
  } catch (error) {
    next(error);
  }
};

// Vérifie si l'utilisateur peut modifier la propriété
export const canEditProperty = async (req: Request, res: Response, next: NextFunction) => {
  // Si l'utilisateur est admin, il peut tout modifier
  if (req.user?.userType === 'ADMIN') {
    return next();
  }

  // Si c'est le propriétaire, vérifier qu'il peut encore modifier la propriété
  if (req.property && req.property.owner_id === req.user?.id) {
    // Ici, vous pouvez ajouter des règles supplémentaires
    // Par exemple, empêcher la modification d'une propriété déjà louée
    if (req.property.status === 'LOUE') {
      return next(new AppError('Impossible de modifier une propriété déjà louée', 403));
    }
    return next();
  }

  // Sinon, accès refusé
  return next(new AppError('Non autorisé à modifier cette propriété', 403));
};

// Vérifie si l'utilisateur peut supprimer la propriété
export const canDeleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  // Si l'utilisateur est admin, il peut tout supprimer
  if (req.user?.userType === 'ADMIN') {
    return next();
  }

  // Si c'est le propriétaire, vérifier qu'il peut encore supprimer la propriété
  if (req.property && req.property.owner_id === req.user?.id) {
    // Ici, vous pouvez ajouter des règles supplémentaires
    // Par exemple, empêcher la suppression d'une propriété avec des locations en cours
    const hasActiveRentals = await db('rentals')
      .where('property_id', req.property.id)
      .whereIn('status', ['EN_COURS', 'A_VENIR'])
      .first();

    if (hasActiveRentals) {
      return next(new AppError('Impossible de supprimer une propriété avec des locations en cours', 403));
    }
    return next();
  }

  // Sinon, accès refusé
  return next(new AppError('Non autorisé à supprimer cette propriété', 403));
};
