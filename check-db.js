import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configuration des chemins pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

async function checkDatabase() {
  try {
    // Configuration de la connexion SQLite
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.resolve(__dirname, 'database.sqlite'),
      logging: console.log
    });

    // Tester la connexion
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    // Lister toutes les tables
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    console.log('Tables in database:', tables);

    // Pour chaque table, afficher sa structure
    for (const table of tables) {
      console.log(`\nStructure of table ${table.name}:`);
      const [columns] = await sequelize.query(`PRAGMA table_info(${table.name})`);
      console.log(columns);
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase();
