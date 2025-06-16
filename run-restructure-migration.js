import { Sequelize } from 'sequelize';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration de la base de données
const dbPath = path.resolve(__dirname, 'data', 'database.sqlite');

// Créer une instance Sequelize
// Configuration de Sequelize pour SQLite avec gestion des verrous améliorée
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: (msg) => console.log(msg),
  retry: {
    max: 5,
    timeout: 30000
  },
  pool: {
    max: 1, // Important pour SQLite pour éviter les verrous
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    useUTC: false
  },
  benchmark: false
});

// Fonction utilitaire pour ajouter un délai
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Configuration du système de logs
const logStream = fs.createWriteStream('migration.log', { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  logStream.write(logMessage);
}

async function runRestructureMigration() {
  log('Démarrage de la migration...');
  const transaction = await sequelize.transaction();
  
  try {
    log('Transaction démarrée avec succès');
    log('Démarrage de la restructuration des tables utilisateur...');
    
    // Importer et exécuter la migration de restructuration
    const migrationPath = `file://${path.join(__dirname, 'server', 'migrations', '20250612122300-restructure-user-tables.js').replace(/\\/g, '/')}`;
    log(`Chargement de la migration: ${migrationPath}`);
    
    const migrationModule = await import(migrationPath);
    const migration = migrationModule.default || migrationModule;
    
    if (typeof migration.up !== 'function') {
      throw new Error("La migration n'a pas de fonction 'up' valide");
    }
    
    log('Exécution de la migration de restructuration...');
    
    // Créer la table SequelizeMeta si elle n'existe pas
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        "name" VARCHAR(255) NOT NULL,
        PRIMARY KEY ("name"),
        UNIQUE ("name")
      );
    `, { transaction });
    
    // Exécuter la migration
    await migration.up(sequelize.getQueryInterface(), Sequelize, { transaction });
    
    // Marquer la migration comme exécutée
    await sequelize.query(
      'INSERT OR IGNORE INTO SequelizeMeta (name) VALUES (?)',
      { 
        replacements: ['20250612122300-restructure-user-tables.js'],
        transaction 
      }
    );
    
    await transaction.commit();
    log('✅ Restructuration des tables utilisateur terminée avec succès!');
    log('Fermeture de la connexion à la base de données...');
  } catch (error) {
    await transaction.rollback();
    log(`❌ Erreur lors de la migration: ${error.message}\n${error.stack}`);
    log('Annulation de la transaction...');
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  log(`UNHANDLED REJECTION at: ${promise}. Reason: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`UNCAUGHT EXCEPTION: ${error.message}\n${error.stack}`);
  process.exit(1);
});

// Exécuter la migration
log('Lancement de la restructuration des tables utilisateur...');
runRestructureMigration()
  .then(() => {
    log('Migration terminée avec succès');
    logStream.end();
    process.exit(0);
  })
  .catch(error => {
    log(`❌ Erreur fatale: ${error.message}\n${error.stack}`);
    logStream.end();
    process.exit(1);
  });
