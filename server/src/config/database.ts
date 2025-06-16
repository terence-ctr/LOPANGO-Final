import { Sequelize, Options } from 'sequelize';
import config from '../config/config';
import logger from '../utils/logger';

// Configuration de la base de données
const dbConfig: Options = {
  database: config.db.name,
  username: config.db.user,
  password: config.db.password,
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  logging: config.db.logging ? (msg) => logger.debug(msg) : false,
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true, // Active le soft delete (suppression logique)
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  },
  pool: {
    max: 10, // Nombre maximum de connexions dans le pool
    min: 0,  // Nombre minimum de connexions dans le pool
    acquire: 30000, // Délai maximum d'attente pour obtenir une connexion (ms)
    idle: 10000, // Délai maximum d'inactivité d'une connexion (ms)
  },
  // Désactive les logs SQL dans les tests
  ...(config.nodeEnv === 'test' && { logging: false }),
};

// Création de l'instance Sequelize
const sequelize = new Sequelize(dbConfig);

// Test de la connexion à la base de données
const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Connexion à la base de données établie avec succès.');
  } catch (error) {
    logger.error('❌ Impossible de se connecter à la base de données:', error);
    // En production, on ne veut pas arrêter le serveur immédiatement
    if (config.nodeEnv === 'production') {
      logger.warn('Le serveur continue de fonctionner mais certaines fonctionnalités peuvent être limitées.');
    } else {
      // En développement/test, on arrête le serveur pour forcer la correction du problème
      process.exit(1);
    }
  }
};

export { sequelize, testConnection };

export default sequelize;
