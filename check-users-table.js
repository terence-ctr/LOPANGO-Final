import knex from 'knex';
import knexConfig from './knexfile.js';

const config = knexConfig.development;
const db = knex(config);

async function checkPropertiesTable() {
  try {
    const columns = await db.raw('PRAGMA table_info(properties)');
    console.log('Colonnes de la table properties :');
    console.table(columns);
    
    // Vérifier si les colonnes problématiques existent déjà
    const existingColumns = columns.map(col => col.name);
    const problemColumns = [
      'equipment',
    ];
    
    console.log('\nColonnes problématiques déjà présentes :');
    problemColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`- ${col} (existe déjà)`);
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification de la table properties :', error);
  } finally {
    await db.destroy();
  }
}

checkPropertiesTable();
