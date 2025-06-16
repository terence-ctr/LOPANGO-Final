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

async function runAddTimestampsMigration() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Démarrage de la migration pour ajouter les timestamps...');
    
    // Importer et exécuter la migration spécifique
    const migrationPath = `file://${path.join(__dirname, 'server', 'migrations', '20250613172000-add-timestamps-to-users.js').replace(/\\/g, '/')}`;
    console.log(`Chargement de la migration: ${migrationPath}`);
    
    const { up } = await import(migrationPath);
    console.log("Migration chargée, exécution de la méthode 'up'...");
    
    if (typeof up !== 'function') {
      throw new Error("La migration n'a pas de fonction 'up' valide");
    }
    
    console.log('Exécution de la migration...');
    await up(sequelize.getQueryInterface(), Sequelize, { transaction });
    
    // Marquer la migration comme exécutée
    await sequelize.query(
      'INSERT OR IGNORE INTO SequelizeMeta (name) VALUES (?);',
      { 
        replacements: ['20250613172000-add-timestamps-to-users.js'],
        transaction 
      }
    );
    
    await transaction.commit();
    console.log('✅ Migration exécutée avec succès!');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Exécuter la migration
console.log('Lancement de la migration pour ajouter les timestamps...');
runAddTimestampsMigration().catch(console.error);
