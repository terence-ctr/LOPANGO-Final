import knex from 'knex';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './server/database/lopango_dev.sqlite3'
  },
  useNullAsDefault: true
});

async function checkContractsTable() {
  let connection;
  try {
    try {
      connection = await db.initialize();
    if (!tableExists) {
      console.log('La table contracts n\'existe pas.');
      return;
    }

    console.log('=== Structure de la table contracts ===');
    
    // Récupérer les colonnes de la table
    const columns = await db('contracts').columnInfo();
    console.log('Colonnes de la table contracts:');
    console.log(columns);
    
    // Compter le nombre d'entrées
    const count = await db('contracts').count('* as count').first();
    console.log(`\nNombre de contrats: ${count.count}`);
    
    // Afficher quelques exemples de contrats
    if (count.count > 0) {
      console.log('\nExemple de contrats (limité à 5) :');
      const sampleContracts = await db('contracts')
        .select('id', 'property_name', 'property_address', 'property_status')
        .limit(5);
      
      console.log(sampleContracts);
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification de la table contracts:', error);
  } finally {
    if (connection) {
      await connection.destroy();
    }
  }
}

// Exécuter la vérification
checkContractsTable();
