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
  const trx = await db.transaction();
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé' 
      });
    }

    const {
      title, description, type = propertyConfig.defaults.type, 
      status = propertyConfig.defaults.status as PropertyStatus,
      address, city, postal_code, country = propertyConfig.defaults.country,
      latitude, longitude, area, 
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

    const [propertyId] = await trx('properties').insert({
      owner_id: userId,
      title,
      description,
      type,
      status,
      address,
      city,
      postal_code,
      country,
      latitude,
      longitude,
      area,
      rooms,
      bathrooms,
      floor,
      furnished,
      equipment: JSON.stringify(
        Array.isArray(equipment) 
          ? equipment.filter(eq => propertyConfig.equipment.some(e => e.value === eq))
          : []
      ),
      has_elevator,
      has_parking,
      has_balcony,
      has_terrace,
      has_garden,
      has_pool,
      has_air_conditioning,
      has_heating,
      rent,
      charges,
      deposit,
      currency,
      year_built,
      is_featured,
      available_from: available_from ? new Date(available_from) : null,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');

    // Récupérer la propriété créée avec toutes ses données
    const [createdProperty] = await trx('properties')
      .where('id', propertyId)
      .select('*');

    // Convertir la chaîne JSON equipment en tableau si nécessaire
    const equipmentList = typeof createdProperty.equipment === 'string' 
      ? JSON.parse(createdProperty.equipment)
      : createdProperty.equipment || [];

    // Créer un objet réponse avec les données formatées
    const responseData = {
      ...createdProperty,
      equipment: equipmentList,
      // Ajouter l'URL complète pour les images si nécessaire
      images: []
    };

    await trx.commit();

    console.log('Propriété créée avec succès:', responseData);
    
    res.status(201).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    await trx.rollback();
    console.error('Erreur lors de la création de la propriété:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la propriété',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      message: 'Erreur lors de la récupération des propriétés'
    });
  }
};

// Récupérer une propriété par son ID
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await db('properties').where({ id }).first();
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propriété non trouvée'
      });
    }
    
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
      message: 'Erreur lors de la récupération de la propriété'
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
      return res.status(401).json({ 
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
      return res.status(404).json({
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      return res.status(401).json({ 
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
      return res.status(404).json({
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
