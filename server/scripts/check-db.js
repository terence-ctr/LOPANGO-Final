import knex from 'knex';
import config from '../knexfile.js';

async function checkDatabase() {
  const db = knex(config.development);
  
  try {
    console.log('Vérification des tables dans la base de données...');
    
    // Vérifier si la table contracts existe
    const hasContractsTable = await db.schema.hasTable('contracts');
    console.log('Table contracts existe:', hasContractsTable);
    
    if (hasContractsTable) {
      // Afficher la structure de la table contracts
      const columns = await db('contracts').columnInfo();
      console.log('Colonnes de la table contracts:', JSON.stringify(columns, null, 2));
      
      // Compter le nombre d'entrées
      const count = await db('contracts').count('* as count').first();
      console.log('Nombre de contrats dans la base:', count?.count);
    }
    
    // Vérifier les autres tables importantes
    const tables = ['users', 'properties', 'contracts'];
    for (const table of tables) {
      const exists = await db.schema.hasTable(table);
      console.log(`Table ${table} existe:`, exists);
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
  } finally {
    await db.destroy();
  }
}

checkDatabase().catch(console.error);
