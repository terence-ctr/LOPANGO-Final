import { sequelize } from '../config/database';
import { User } from '../models/User';
import logger from '../utils/logger';
import { generateUserId } from '../utils/idGenerator';

// Fonction pour initialiser la base de données avec des utilisateurs de test
const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info('Début de l\'initialisation de la base de données...');
    
    // Synchronisation des modèles avec la base de données
    await sequelize.sync({ force: true });
    logger.info('Modèles synchronisés avec succès');
    
    // Création des utilisateurs de test
    /*
    const testUsers = [
      {
        id: generateUserId('admin'),
        email: 'admin@lopango.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'System',
        phone: '+1234567890',
        userType: 'admin' as const,
        status: 'active' as const,
        emailVerified: true,
        phoneVerified: true,
      },
      {
        id: generateUserId('agent'),
        email: 'agent@lopango.com',
        password: 'Agent123!',
        firstName: 'Agent',
        lastName: 'Immobilier',
        phone: '+1234567891',
        userType: 'agent' as const,
        status: 'active' as const,
        emailVerified: true,
        phoneVerified: true,
      },
      {
        id: generateUserId('landlord'),
        email: 'proprietaire@lopango.com',
        password: 'Landlord123!',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '+1234567892',
        userType: 'landlord' as const,
        status: 'active' as const,
        emailVerified: true,
        phoneVerified: true,
      },
      {
        id: generateUserId('tenant'),
        email: 'locataire@lopango.com',
        password: 'Tenant123!',
        firstName: 'Marie',
        lastName: 'Martin',
        phone: '+1234567893',
        userType: 'tenant' as const,
        status: 'active' as const,
        emailVerified: true,
        phoneVerified: true,
      },
      {
        id: generateUserId('tenant'),
        email: 'locataire2@lopango.com',
        password: 'Tenant123!',
        firstName: 'Pierre',
        lastName: 'Durand',
        phone: '+1234567894',
        userType: 'tenant' as const,
        status: 'pending_verification' as const,
        emailVerified: false,
        phoneVerified: true,
      },
    ];
    */

    // Création des utilisateurs dans la base de données
    /*
    for (const userData of testUsers) {
      const user = User.build(userData);
      await user.save();
      logger.info(`Utilisateur créé: ${user.email} (${user.id})`);
    }
    */

    logger.info('Base de données initialisée avec succès !');
    
    // Afficher les identifiants de test
    /*
    console.log('\n=== IDENTIFIANTS DE TEST ===');
    console.log('Admin: admin@lopango.com / Admin123!');
    console.log('Agent: agent@lopango.com / Agent123!');
    console.log('Propriétaire: proprietaire@lopango.com / Landlord123!');
    console.log('Locataire: locataire@lopango.com / Tenant123!');
    console.log('Locataire (en attente): locataire2@lopango.com / Tenant123!\n');
    */
    
    process.exit(0);
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
};

// Exécuter le script d'initialisation
initializeDatabase();
