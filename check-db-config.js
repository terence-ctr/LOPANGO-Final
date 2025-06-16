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
    // Chemin absolu vers la base de données
    const dbPath = path.resolve(__dirname, 'database.sqlite');
    console.log('Chemin de la base de données:', dbPath);
    
    // Vérifier si le fichier existe
    const fs = await import('fs');
    const dbExists = fs.existsSync(dbPath);
    console.log('Le fichier de base de données existe:', dbExists);
    
    // Configuration de la connexion SQLite
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging: console.log
    });

    // Tester la connexion
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');

    // Exécuter les migrations
    console.log('Exécution des migrations...');
    const { execSync } = await import('child_process');
    
    try {
      // Exécuter les migrations avec Sequelize CLI
      execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
      console.log('Migrations exécutées avec succès!');
      
      // Vérifier les tables après les migrations
      const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      console.log('Tables dans la base de données:', tables);
      
      // Pour chaque table, afficher sa structure
      for (const table of tables) {
        console.log(`\nStructure de la table ${table.name}:`);
        const [columns] = await sequelize.query(`PRAGMA table_info(${table.name})`);
        console.log(columns);
      }
    } catch (migrationError) {
      console.error('Erreur lors de l\'exécution des migrations:', migrationError);
    }

    await sequelize.close();
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
  }
}

checkDatabase();
