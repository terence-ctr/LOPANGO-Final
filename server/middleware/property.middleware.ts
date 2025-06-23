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
  const propertyData = req.body;
  const errors: Record<string, string> = {};

  // Vérification du titre
  if (!propertyData.title || propertyData.title.trim() === '') {
    errors.title = 'Le titre est obligatoire';
  } else if (propertyData.title.length < propertyConfig.validation.title.minLength || 
             propertyData.title.length > propertyConfig.validation.title.maxLength) {
    errors.title = `Le titre doit contenir entre ${propertyConfig.validation.title.minLength} et ${propertyConfig.validation.title.maxLength} caractères`;
  }

  // Vérification du type
  if (!propertyData.type || !propertyConfig.propertyTypes.some(t => t.value === propertyData.type)) {
    errors.type = 'Type de propriété invalide';
  }

  // Vérification de l'adresse
  if (!propertyData.address || propertyData.address.trim() === '') {
    errors.address = 'L\'adresse est obligatoire';
  }

  // Vérification de la ville
  if (!propertyData.city || propertyData.city.trim() === '') {
    errors.city = 'La ville est obligatoire';
  }

  // Vérification du code postal
  if (!propertyData.postal_code || !/^\d{5}$/.test(propertyData.postal_code)) {
    errors.postal_code = 'Code postal invalide (5 chiffres requis)';
  }

  // Vérification de la surface
  const area = parseFloat(propertyData.area);
  if (isNaN(area) || area < propertyConfig.validation.area.min || area > propertyConfig.validation.area.max) {
    errors.area = `La surface doit être comprise entre ${propertyConfig.validation.area.min} et ${propertyConfig.validation.area.max} m²`;
  }

  // Vérification du loyer si fourni
  if (propertyData.rent !== undefined) {
    const rent = parseFloat(propertyData.rent);
    if (isNaN(rent) || rent < propertyConfig.validation.rent.min || rent > propertyConfig.validation.rent.max) {
      errors.rent = `Le loyer doit être compris entre ${propertyConfig.validation.rent.min} et ${propertyConfig.validation.rent.max} ${propertyData.currency || 'EUR'}`;
    }
  }

  // Vérification des équipements
  if (propertyData.equipment && Array.isArray(propertyData.equipment)) {
    const invalidEquipment = propertyData.equipment.filter(
      (eq: string) => !propertyConfig.equipment.some(e => e.value === eq)
    );
    
    if (invalidEquipment.length > 0) {
      errors.equipment = `Équipement(s) invalide(s): ${invalidEquipment.join(', ')}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation des données',
      errors
    });
  }

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
