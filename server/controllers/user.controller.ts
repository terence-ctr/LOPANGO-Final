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
      .where({ user_type })
      .select(
        'id',
        'email',
        'first_name',
        'last_name',
        'user_type',
        'is_active',
        'email_verified',
        'address',
        'identity',
        'nationality'
      );

    const users = usersFromDb.map(user => ({
      ...user,
      email_verified: !!user.email_verified,
      address: typeof user.address === 'string' ? JSON.parse(user.address) : user.address,
      identity: typeof user.identity === 'string' ? JSON.parse(user.identity) : user.identity,
    }));

    const userIds = users.map(u => u.id);
    console.log(`Utilisateurs récupérés pour le user_type '${user_type}': ${userIds.length} trouvé(s). IDs: [${userIds.join(', ')}]`);

    res.status(200).json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    next(error);
  }
};
