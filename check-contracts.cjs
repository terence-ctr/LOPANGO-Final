// Utilisation de .cjs pour forcer CommonJS
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './server/database/lopango_dev.sqlite3'
  },
  useNullAsDefault: true
});

async function checkContractsTable() {
  try {
    // Vérifier si la table contracts existe
    const tableExists = await knex.schema.hasTable('contracts');
    
    if (!tableExists) {
      console.log('La table contracts n\'existe pas.');
      return;
    }

    console.log('=== Structure de la table contracts ===');
    
    // Récupérer les colonnes de la table
    const columns = await knex('contracts').columnInfo();
    console.log('\n=== Structure de la table contracts ===');
    console.log('Colonne'.padEnd(25) + 'Type'.padEnd(15) + 'Nullable'.padEnd(10) + 'Default');
    console.log('-'.repeat(60));
    
    for (const [column, info] of Object.entries(columns)) {
      console.log(
        column.padEnd(25) + 
        (info.type || '').padEnd(15) + 
        (info.nullable ? 'OUI' : 'NON').padEnd(10) + 
        (info.defaultValue || 'NULL')
      );
    }
    
    // Compter le nombre d'entrées
    const count = await knex('contracts').count('* as count').first();
    console.log(`\nNombre de contrats: ${count.count}`);
    
    // Afficher quelques exemples de contrats
    if (count.count > 0) {
      console.log('\n=== Exemples de contrats (5 premiers) ===');
      const sampleContracts = await knex('contracts')
        .select('*')
        .limit(5);
      
      sampleContracts.forEach((contract, index) => {
        console.log(`\n--- Contrat #${index + 1} ---`);
        for (const [key, value] of Object.entries(contract)) {
          console.log(`${key.padEnd(25)}: ${value || 'NULL'}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification de la table contracts:', error);
  } finally {
    await knex.destroy();
  }
}

// Exécuter la vérification
checkContractsTable();
