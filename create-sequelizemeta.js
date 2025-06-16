import { Sequelize } from 'sequelize';
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

async function createSequelizeMeta() {
  try {
    // Créer la table SequelizeMeta si elle n'existe pas
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        "name" VARCHAR(255) NOT NULL,
        PRIMARY KEY ("name"),
        UNIQUE ("name")
      );
    `);
    
    console.log('✅ Table SequelizeMeta créée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table SequelizeMeta:', error);
  } finally {
    await sequelize.close();
  }
}

// Exécuter la fonction
console.log('Création de la table SequelizeMeta...');
createSequelizeMeta().catch(console.error);
