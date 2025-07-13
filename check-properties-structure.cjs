require('dotenv').config();
const knex = require('knex');
const knexConfig = require('./knexfile.cjs');
const path = require('path');

async function checkPropertiesStructure() {
  console.log('Vérification de la structure de la table properties...');
  let db;
  
  try {
    const config = {
      ...knexConfig.development,
      connection: {
        ...knexConfig.development.connection,
        filename: path.resolve(process.env.DATABASE_URL || knexConfig.development.connection.filename)
      }
    };
    
    db = knex(config);
    
    // Récupérer les informations sur les colonnes de la table properties
    const columns = await db.raw('PRAGMA table_info(properties)');
    
    console.log('\nStructure de la table properties :');
    console.log('----------------------------------');
    console.log(columns.map(c => `${c.name} (${c.type}${c.notnull ? ' NOT NULL' : ''}${c.dflt_value ? ` DEFAULT ${c.dflt_value}` : ''})`).join('\n'));
    
    // Vérifier la présence de quelques enregistrements
    const sampleData = await db('properties').select('*').limit(2);
    console.log('\nExemple de données :');
    console.log('----------------------------------');
    console.log(JSON.stringify(sampleData, null, 2));
    
  } catch (error) {
    console.error('Erreur lors de la vérification de la structure :', error);
  } finally {
    if (db) await db.destroy();
  }
}

checkPropertiesStructure();
