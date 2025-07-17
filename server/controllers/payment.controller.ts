import { Request, Response } from 'express';
import { db } from '../database';

// POST /payments : Créer un paiement
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { amount, property_id, comment, date } = req.body;
    const user = req.user;

    // Contraintes de validation
    if (!user || user.userType !== 'agent') {
      return res.status(403).json({ status: 'error', message: 'Seul un agent peut enregistrer un paiement.' });
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'Le montant doit être un nombre positif.' });
    }
    if (!property_id || isNaN(property_id)) {
      return res.status(400).json({ status: 'error', message: 'La propriété est requise.' });
    }
    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
      return res.status(400).json({ status: 'error', message: 'Le commentaire est obligatoire.' });
    }
    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({ status: 'error', message: 'La date du paiement est invalide.' });
    }

    // Vérifier que la propriété existe
    const propertyExists = await db('properties').where('id', property_id).first();
    if (!propertyExists) {
      return res.status(404).json({ status: 'error', message: 'La propriété spécifiée est introuvable.' });
    }

    // Insérer le paiement dans la table
    const [id] = await db('payments').insert({
      amount,
      property_id,
      agent_id: user.id,
      comment,
      date,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('id');

    return res.status(201).json({
      status: 'success',
      message: 'Paiement enregistré avec succès.',
      data: { id, amount, property_id, comment, date, agent_id: user.id }
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la création du paiement.' });
  }
};

// GET /payments : Liste des paiements
export const getPayments = async (req: Request, res: Response) => {
  try {
    const rows = await db('payments')
      .leftJoin('properties', 'payments.property_id', 'properties.id')
      .leftJoin('users as agents', 'payments.agent_id', 'agents.id')
      .select(
        'payments.id',
        'payments.amount',
        'payments.comment',
        'payments.date',
        'payments.created_at',
        'properties.title as property',
        'agents.first_name as agent_first_name',
        'agents.last_name as agent_last_name'
      )
      .orderBy('payments.created_at', 'desc');
    return res.json({ status: 'success', data: rows });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la récupération des paiements.' });
  }
}; 