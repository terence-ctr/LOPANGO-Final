import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, 'migrations');

async function convertMigrations() {
  try {
    // Lire tous les fichiers de migration
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && !file.endsWith('.d.ts'));

    console.log(`Found ${files.length} migration files to convert`);

    // Convertir chaque fichier
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Vérifier si le fichier utilise déjà ES modules
      if (content.includes('export default')) {
        console.log(`✓ ${file} is already using ES modules`);
        continue;
      }
      
      // Convertir CommonJS en ES modules
      content = content
        .replace(/^'use strict';?\s*/gm, '') // Supprimer 'use strict'
        .replace(/module\.exports\s*=\s*{/g, 'export default {'); // Remplacer module.exports par export default
      
      // Ajouter des imports si nécessaire
      if (content.includes('Sequelize')) {
        content = `import { DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
${content}`;
      }
      
      // Écrire les modifications
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Converted ${file} to ES modules`);
    }
    
    console.log('✅ All migrations converted to ES modules');
  } catch (error) {
    console.error('❌ Error converting migrations:', error);
    process.exit(1);
  }
}

convertMigrations().catch(console.error);
