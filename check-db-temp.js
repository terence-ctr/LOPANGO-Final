import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Sequelize } from 'sequelize';
import config from './config/config.js';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkDatabase() {
  try {
    const sequelize = new Sequelize(config.development);
    
    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
    
    // Vérifier si la table Users existe
    const [results] = await sequelize.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='Users';
    `);
    
    if (results.length > 0) {
      console.log('✅ La table Users existe déjà.');
    } else {
      console.log('❌ La table Users n\'existe pas. Exécution des migrations...');
      execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
      console.log('✅ Migrations exécutées avec succès.');
    }
    
    // Afficher toutes les tables
    const [tables] = await sequelize.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `);
    
    console.log('\n📋 Tables dans la base de données:');
    console.table(tables);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la base de données:');
    console.error(error);
    process.exit(1);
  }
}

checkDatabase().catch(console.error);
