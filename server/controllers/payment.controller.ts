import { Request, Response } from 'express';
import { db } from '../database/db';

export const getPayments = async (req: Request, res: Response): Promise<void> => {
  console.log('=== DÉBUT getPayments ===');
  console.log('Headers:', req.headers);
  console.log('User:', (req as any).user);
  console.log('Query params:', req.query);
  
  try {
    // Récupérer les paramètres de requête
    const { 
      limit = '10', 
      offset = '0', 
      status,
      propertyId,
      contractId,
      userId,
      startDate,
      endDate,
      sortBy = 'paymentDate',
      sortOrder = 'desc'
    } = req.query;
    
    console.log('Paramètres traités:', { limit, offset, status, propertyId, contractId, userId, startDate, endDate, sortBy, sortOrder });

    // Construire la requête de base
    let query = db('payments')
      .select(
        'payments.*',
        'properties.title as propertyTitle',
        'contracts.reference as contractReference',
        'users.first_name as userFirstName',
        'users.last_name as userLastName'
      )
      .leftJoin('properties', 'payments.property_id', 'properties.id')
      .leftJoin('contracts', 'payments.contract_id', 'contracts.id')
      .leftJoin('users', 'payments.user_id', 'users.id')
      .limit(parseInt(limit as string, 10))
      .offset(parseInt(offset as string, 10));
    
    // Ajouter le tri si le champ existe
    if (['amount', 'payment_date', 'created_at', 'updated_at'].includes(sortBy as string)) {
      query = query.orderBy(sortBy as string, sortOrder as 'asc' | 'desc');
    } else {
      // Tri par défaut si le champ de tri n'est pas valide
      query = query.orderBy('payment_date', 'desc');
    }

    // Appliquer les filtres
    if (status) {
      query = query.whereIn('payments.status', (status as string).split(','));
    }

    if (propertyId) {
      query = query.where('payments.propertyId', propertyId as string);
    }

    if (contractId) {
      query = query.where('payments.contractId', contractId as string);
    }

    if (userId) {
      query = query.where('payments.userId', userId as string);
    }

    if (startDate) {
      query = query.where('payments.paymentDate', '>=', startDate as string);
    }

    if (endDate) {
      query = query.where('payments.paymentDate', '<=', endDate as string);
    }

    const payments = await query;
    
    // Récupérer le nombre total de paiements pour la pagination
    const countQuery = db('payments').count('* as total');
    const totalResult = await countQuery.first();
    const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;

    res.status(200).json({
      data: payments,
      pagination: {
        total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      }
    });
    return;
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements' });
  }
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      amount, 
      currency = 'EUR', 
      status = 'pending', 
      paymentMethod, 
      reference, 
      description, 
      propertyId, 
      contractId, 
      paymentDate = new Date().toISOString(),
      dueDate,
      userId
    } = req.body;

    // Validation des données requises
    if (!amount || !paymentMethod || !reference) {
      res.status(400).json({ 
        message: 'Les champs amount, paymentMethod et reference sont obligatoires' 
      });
      return;
    }

    const [payment] = await db('payments')
      .insert({
        amount,
        currency,
        status,
        paymentMethod,
        reference,
        description,
        propertyId,
        contractId,
        paymentDate,
        dueDate: dueDate || paymentDate,
        userId: userId || req.user?.id, // Utiliser l'ID de l'utilisateur connecté si non fourni
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning('*');

    res.status(201).json(payment);
    return;
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la création du paiement' });
  }
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      status, 
      paymentDate, 
      reference, 
      description 
    } = req.body;

    const updates: Record<string, any> = {
      updatedAt: new Date()
    };

    if (status) updates.status = status;
    if (paymentDate) updates.paymentDate = paymentDate;
    if (reference) updates.reference = reference;
    if (description !== undefined) updates.description = description;

    const [updatedPayment] = await db('payments')
      .where('id', id)
      .update(updates)
      .returning('*');

    if (!updatedPayment) {
      res.status(404).json({ message: 'Paiement non trouvé' });
      return;
    }

    res.status(200).json(updatedPayment);
    return;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du paiement' });
  }
};

export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await db('payments')
      .where('id', id)
      .del();

    if (!deleted) {
      res.status(404).json({ message: 'Paiement non trouvé' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du paiement' });
  }
};
