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
      read,
      priority,
      type,
      propertyId,
      contractId,
      userId
    } = req.query;
    
    console.log('Paramètres traités:', { limit, offset, read, priority, type, propertyId, contractId, userId });

    // Construire la requête de base
    let query = db('alerts')
      .select('*')
      .limit(parseInt(limit as string, 10))
      .offset(parseInt(offset as string, 10));
    
    // Ajouter le tri sur created_at (snake_case par convention SQL)
    query = query.orderBy('created_at', 'desc');

    // Appliquer les filtres
    if (read !== undefined) {
      query = query.where('isRead', read === 'true');
    }

    if (priority) {
      query = query.whereIn('priority', (priority as string).split(','));
    }

    if (type) {
      query = query.whereIn('type', (type as string).split(','));
    }

    if (propertyId) {
      query = query.where('propertyId', propertyId as string);
    }

    if (contractId) {
      query = query.where('contractId', contractId as string);
    }

    if (userId) {
      query = query.where('userId', userId as string);
    }

    const alerts = await query;
    
    // Récupérer le nombre total d'alertes pour la pagination
    const countQuery = db('alerts').count('* as total');
    const totalResult = await countQuery.first();
    const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;

    res.status(200).json({
      data: alerts,
      pagination: {
        total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      }
    });
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
