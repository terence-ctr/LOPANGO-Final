const knex = require('./server/database/knex');

async function checkTable() {
  try {
    // Vérifier si la table properties existe
    const exists = await knex.schema.hasTable('properties');
    console.log('La table properties existe :', exists);
    
    if (exists) {
      // Afficher les colonnes de la table
      const columns = await knex('properties').columnInfo();
      console.log('Colonnes de la table properties :', Object.keys(columns));
      
      // Vérifier si la colonne owner_id existe
      console.log('La colonne owner_id existe :', 'owner_id' in columns);
      
      // Vérifier si la colonne landlord_id existe
      console.log('La colonne landlord_id existe :', 'landlord_id' in columns);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de la table :', error);
  } finally {
    await knex.destroy();
  }
}

checkTable();
