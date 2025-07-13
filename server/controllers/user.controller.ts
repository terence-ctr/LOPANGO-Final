import { RequestHandler } from 'express';
import { db } from '../database';

export const getUsers: RequestHandler = async (req, res, next) => {
  // Ne pas retourner la réponse directement, utiliser res.json()
  // et appeler next() si nécessaire
  try {
    console.log('=== DÉBUT getUsers ===');
    console.log('Headers de la requête:', req.headers);
    console.log('Paramètres de la requête:', req.query);
    
    const { user_type } = req.query;

    if (!user_type) {
      console.error('Erreur: Le paramètre user_type est manquant');
      res.status(400).json({ 
        success: false,
        message: 'Le paramètre de user_type est requis.' 
      });
      return;
    }

    console.log(`Récupération des utilisateurs de type: ${user_type}`);

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

    usersFromDb.forEach((user, index) => {
      
      // Informations d'identité
      
      // Autres informations
        });
    
    console.log('\n=== FIN DES INFORMATIONS DÉTAILLÉES ===\n');

    const users = usersFromDb.map(user => {
      const userData = {
        _id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        isActive: user.is_active,
        email_verified: !!user.email_verified,
      address: {
        street: user.street || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        country: user.country || ''
      },
      identity: {
        nationalId: user.national_id || '',
        documentType: user.document_type || 'carte_electeur',
        nationality: user.nationality || 'Congolaise'
      },
        // Champs pour la rétrocompatibilité
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        is_active: user.is_active
      };
      
      console.log('Données utilisateur formatées:', JSON.stringify(userData, null, 2));
      return userData;
    });
    
    console.log('Liste des utilisateurs formatée:', JSON.stringify(users, null, 2));

    const userIds = users.map(u => u.id);
    console.log(`Utilisateurs récupérés pour le user_type '${user_type}': ${userIds.length} trouvé(s). IDs: [${userIds.join(', ')}]`);

    res.status(200).json({
      success: true,
      data: users,
      message: 'Agents récupérés avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    next(error);
  }
};
