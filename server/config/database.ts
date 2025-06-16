import { Sequelize } from 'sequelize';
import config from './config';
import { initModels } from '../models/init-models';

// Configuration de la connexion à la base de données
const isSQLite = process.env.DB_DIALECT === 'sqlite';

const sequelize = isSQLite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || './data/database.sqlite',
      logging: config.nodeEnv === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: true, // Active la conversion automatique camelCase vers snake_case
        freezeTableName: true, // Empêche le pluriel automatique des noms de table
        paranoid: false, // Désactivé pour SQLite
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      // Désactive le mode STRICT pour SQLite
      // pour éviter les erreurs de colonnes non nulles
      dialectOptions: {
        useUTC: false
      },
      // Désactive la journalisation des requêtes brutes
      benchmark: false
    })
  : new Sequelize({
      dialect: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      database: process.env.DB_NAME || 'lopango',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      logging: config.nodeEnv === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: false, // Désactivé pour utiliser les noms de colonnes en camelCase
        paranoid: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

// Initialize database connection and models
const initializeDatabase = async () => {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');

    // Initialize models
    const models = await initModels(sequelize);
    
    // Create the database object
    const db = {
      sequelize,
      Sequelize,
      ...models,
      // Add the testConnection function
      testConnection: async () => {
        try {
          await sequelize.authenticate();
          console.log('Connexion à la base de données vérifiée avec succès.');
          return true;
        } catch (error) {
          console.error('Impossible de vérifier la connexion à la base de données:', error);
          return false;
        }
      },
      // Add the syncDatabase function
      syncDatabase: async (force: boolean = false) => {
        try {
          if (force) {
            console.warn('Forçage de la synchronisation de la base de données. Toutes les données seront perdues !');
            await sequelize.sync({ force: true });
          } else {
            await sequelize.sync({ alter: true });
          }
          console.log('Base de données synchronisée avec succès.');
          return true;
        } catch (error) {
          console.error('Erreur lors de la synchronisation de la base de données:', error);
          return false;
        }
      }
    };

    return db;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
};

// Initialize database and export a promise that resolves to the db object
const dbPromise = initializeDatabase();

// Test de la connexion à la base de données
const testConnection = async (): Promise<void> => {
  const db = await dbPromise;
  return db.testConnection();
};

// Synchronisation des modèles avec la base de données
const syncDatabase = async (force: boolean = false): Promise<boolean> => {
  const db = await dbPromise;
  return db.syncDatabase(force);
};

// Export the database promise
const getDb = async () => {
  return await dbPromise;
};

export { sequelize, testConnection, syncDatabase, getDb };
export default dbPromise;
