const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/database.js')[env];

console.log(`Running migrations for ${env} environment...`);
console.log(`Database: ${dbConfig.database}`);

// Vérifier si on utilise SQLite
if (dbConfig.dialect === 'sqlite') {
  console.log('Using SQLite database');
  if (dbConfig.storage) {
    console.log(`SQLite storage: ${dbConfig.storage}`);
  }
}

try {
  // Exécuter les migrations
  console.log('Running migrations...');
  execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
  
  console.log('Migrations completed successfully!');
  
  // Exécuter les seeders si en développement
  if (env === 'development' || env === 'test') {
    console.log('Running seeders...');
    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
    console.log('Seeders completed successfully!');
  }
  
  process.exit(0);
} catch (error) {
  console.error('Error running migrations:', error);
  process.exit(1);
}
