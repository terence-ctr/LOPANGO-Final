import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données
const dbPath = path.resolve(__dirname, 'data', 'database.sqlite');

// Créer une instance Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
});

async function runUpdateUserMigration() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Démarrage de la migration de mise à jour de la table users...');
    
    // Importer et exécuter la migration spécifique
    const migrationPath = `file://${path.join(__dirname, 'migrations', '20240611230000-update-user-structure.js').replace(/\\/g, '/')}`;
    console.log(`Chargement de la migration: ${migrationPath}`);
    
    const migrationModule = await import(migrationPath);
    const migration = migrationModule.default || migrationModule;
    
    if (typeof migration.up !== 'function') {
      throw new Error("La migration n'a pas de fonction 'up' valide");
    }
    
    console.log('Exécution de la migration...');
    await migration.up(sequelize.getQueryInterface(), Sequelize, { transaction });
    
    // Marquer la migration comme exécutée
    await sequelize.query(
      'INSERT OR IGNORE INTO SequelizeMeta (name) VALUES (?)',
      { 
        replacements: ['20240611230000-update-user-structure.js'],
        transaction 
      }
    );
    
    await transaction.commit();
    console.log('✅ Migration de mise à jour de la table users exécutée avec succès!');
  } catch (error) {
    console.error('❌ Échec de la migration de mise à jour:');
    console.error(error);
    await transaction.rollback();
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Exécuter la migration spécifique
console.log('Lancement de la migration de mise à jour de la table users...');
runUpdateUserMigration().catch(console.error);
