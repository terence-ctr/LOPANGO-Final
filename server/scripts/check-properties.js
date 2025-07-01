import knex from 'knex';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: '../database.sqlite'
  },
  useNullAsDefault: true
});

async function checkPropertiesTable() {
  try {
    // Vérifier si la table existe
    const hasTable = await db.schema.hasTable('properties');
    if (!hasTable) {
      console.log('La table "properties" n\'existe pas.');
      return;
    }

    // Obtenir les informations sur les colonnes
    const columns = await db('properties').columnInfo();
    console.log('Colonnes de la table "properties":', Object.keys(columns));
    
    // Afficher quelques lignes pour voir les données existantes
    const sampleData = await db('properties').select('*').limit(1);
    console.log('\nExemple de données de propriété:', JSON.stringify(sampleData, null, 2));
    
  } catch (error) {
    console.error('Erreur lors de la vérification de la table properties:', error);
  } finally {
    await db.destroy();
  }
}

checkPropertiesTable();
