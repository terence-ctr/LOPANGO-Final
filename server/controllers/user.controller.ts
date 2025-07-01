import { RequestHandler } from 'express';
import { db } from '../database';

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const { user_type } = req.query;

    if (!user_type) {
      res.status(400).json({ message: 'Le paramètre de user_type est requis.' });
      return;
    }

    const usersFromDb = await db('users')
      .where({ 'users.user_type': user_type })
      .leftJoin('addresses', 'users.address_id', 'addresses.id')
      .leftJoin('identities', 'users.identity_id', 'identities.id')
      .select(
        'users.id',
        'users.email',
        'users.first_name',
        'users.last_name',
        'users.user_type',
        'users.is_active',
        'users.email_verified',
        'users.address_id',
        'users.identity_id',
        'addresses.street',
        'addresses.city',
        'addresses.postal_code',
        'addresses.country',
        'identities.national_id',
        'identities.document_type',
        'identities.nationality'
      );

    const users = usersFromDb.map(user => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
      is_active: user.is_active,
      email_verified: !!user.email_verified,
      address_id: user.address_id,
      identity_id: user.identity_id,
      nationality: user.nationality || 'Congolaise',
      address: {
        street: user.street || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        country: user.country || ''
      },
      identity: {
        national_id: user.national_id || '',
        document_type: (() => {
          console.log(`Type de document brut pour l'utilisateur ${user.id}:`, JSON.stringify(user.document_type));
          const formatted = user.document_type ? user.document_type.charAt(0).toUpperCase() + user.document_type.slice(1) : '';
          console.log(`Type de document formaté pour l'utilisateur ${user.id}:`, formatted);
          return formatted;
        })()
      }
    }));

    const userIds = users.map(u => u.id);
    console.log(`Utilisateurs récupérés pour le user_type '${user_type}': ${userIds.length} trouvé(s). IDs: [${userIds.join(', ')}]`);

    res.status(200).json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    next(error);
  }
};
