import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Configuration des chemins pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function initializeDatabase() {
  try {
    console.log('Initialisation de la base de données...');
    
    // Configuration de la connexion SQLite
    const dbPath = path.resolve(process.cwd(), 'database.sqlite');
    console.log('Chemin de la base de données:', dbPath);
    
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging: console.log
    });

    // Tester la connexion
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
    
    // Créer la table SequelizeMeta si elle n'existe pas
    console.log('Création de la table SequelizeMeta...');
    await sequelize.getQueryInterface().createTable('SequelizeMeta', {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
      }
    });
    
    // Exécuter les migrations
    console.log('Exécution des migrations...');
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    
    // Vérifier les tables
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    console.log('Tables dans la base de données:');
    console.table(tables);
    
    await sequelize.close();
    console.log('Base de données initialisée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

// Exécuter l'initialisation
initializeDatabase();
