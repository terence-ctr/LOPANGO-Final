import { Request, Response } from 'express';
import { db } from '../database/db';

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  console.log('=== DÉBUT getAlerts ===');
  console.log('Headers:', req.headers);
  console.log('User:', (req as any).user);
  console.log('Query params:', req.query);
  
  try {
    // Récupérer les paramètres de requête
    const { 
      limit = '10', 
      offset = '0', 
      status,
      type,
      propertyId,
      contractId,
      userId,
      actionRequired,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    console.log('Paramètres traités:', { 
      limit, 
      offset, 
      status, 
      type, 
      propertyId, 
      contractId, 
      userId,
      actionRequired,
      startDate,
      endDate,
      sortBy,
      sortOrder
    });

    // Construire la requête de base
    let query = db('alerts')
      .select(
        'alerts.*',
        'properties.title as property_title',
        'contracts.reference as contract_reference',
        db.raw(`json_object(
          'id', users.id,
          'firstName', users.first_name,
          'lastName', users.last_name,
          'email', users.email
        ) as user`)
      )
      .leftJoin('properties', 'alerts.property_id', 'properties.id')
      .leftJoin('contracts', 'alerts.contract_id', 'contracts.id')
      .leftJoin('users', 'alerts.user_id', 'users.id')
      .limit(parseInt(limit as string, 10))
      .offset(parseInt(offset as string, 10));
    
    // Ajouter le tri
    if (['created_at', 'updated_at', 'type', 'status', 'priority'].includes(sortBy as string)) {
      query = query.orderBy(sortBy as string, sortOrder as 'asc' | 'desc');
    } else {
      query = query.orderBy('created_at', 'desc');
    }

    // Appliquer les filtres
    if (status) {
      query = query.whereIn('alerts.status', (status as string).split(','));
    }

    if (type) {
      query = query.whereIn('alerts.type', (type as string).split(','));
    }

    
    if (propertyId) {
      query = query.where('alerts.property_id', propertyId as string);
    }

    if (contractId) {
      query = query.where('alerts.contract_id', contractId as string);
    }
    
    if (userId) {
      query = query.where('alerts.user_id', userId as string);
    }
    
    if (actionRequired === 'true') {
      query = query.where('alerts.status', 'NEW');
    }
    
    if (startDate) {
      query = query.where('alerts.created_at', '>=', new Date(startDate as string));
    }
    
    if (endDate) {
      query = query.where('alerts.created_at', '<=', new Date(endDate as string));
    }

    // Exécuter la requête pour obtenir les alertes
    const alerts = await query;
    
    // Formater les résultats pour correspondre au type attendu par le frontend
    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      priority: alert.priority || 'MEDIUM',
      status: alert.status || 'NEW',
      createdAt: alert.created_at,
      updatedAt: alert.updated_at,
      read: alert.status !== 'NEW',
      property: alert.property_id ? {
        id: alert.property_id,
        title: alert.property_title
      } : undefined,
      contract: alert.contract_id ? {
        id: alert.contract_id,
        reference: alert.contract_reference
      } : undefined,
      user: alert.user ? JSON.parse(alert.user) : undefined,
      actionRequired: alert.status === 'NEW',
      metadata: typeof alert.metadata === 'string' ? JSON.parse(alert.metadata) : (alert.metadata || {})
    }));
    
    // Récupérer le nombre total d'alertes pour la pagination (avec les mêmes filtres)
    const countQuery = db('alerts').count('* as total');
    
    // Appliquer les mêmes filtres que pour la requête principale
    if (status) {
      countQuery.whereIn('status', (status as string).split(','));
    }
    if (type) {
      countQuery.whereIn('type', (type as string).split(','));
    }
    if (propertyId) {
      countQuery.where('property_id', propertyId as string);
    }
    if (contractId) {
      countQuery.where('contract_id', contractId as string);
    }
    if (userId) {
      countQuery.where('user_id', userId as string);
    }
    if (actionRequired === 'true') {
      countQuery.where('status', 'NEW');
    }
    if (startDate) {
      countQuery.where('created_at', '>=', new Date(startDate as string));
    }
    if (endDate) {
      countQuery.where('created_at', '<=', new Date(endDate as string));
    }
    
    const totalResult = await countQuery.first();
    const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;

    res.status(200).json(formattedAlerts);
    return;
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des alertes' });
    return;
  }
};

export const createAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      type, 
      title, 
      message, 
      priority = 'medium', 
      propertyId, 
      contractId, 
      userId 
    } = req.body;

    // Validation des données requises
    if (!type || !title || !message) {
      res.status(400).json({ message: 'Type, titre et message sont obligatoires' });
      return;
    }

    const [alert] = await db('alerts')
      .insert({
        type,
        title,
        message,
        priority,
        propertyId,
        contractId,
        userId: userId || req.user?.id, // Utiliser l'ID de l'utilisateur connecté si non fourni
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning('*');

    res.status(201).json(alert);
    return;
  } catch (error) {
    console.error('Erreur lors de la création de l\'alerte:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'alerte' });
    return;
  }
};

export const updateAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    if (isRead === undefined) {
      res.status(400).json({ message: 'Le champ isRead est requis' });
      return;
    }

    const [updatedAlert] = await db('alerts')
      .where('id', id)
      .update({
        isRead,
        updatedAt: new Date()
      })
      .returning('*');

    if (!updatedAlert) {
      res.status(404).json({ message: 'Alerte non trouvée' });
      return;
    }

    res.status(200).json(updatedAlert);
    return;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'alerte:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'alerte' });
    return;
  }
};

export const deleteAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await db('alerts')
      .where('id', id)
      .del();

    if (!deleted) {
      res.status(404).json({ message: 'Alerte non trouvée' });
      return;
    }

    res.status(204).send();
    return;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'alerte:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'alerte' });
    return;
  }
};
