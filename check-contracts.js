// check-contracts.js
import dotenv from 'dotenv';
import knex from 'knex';
import knexfile from './knexfile.js';

dotenv.config();
const db = knex(knexfile.development);

async function checkContracts() {
  try {
    console.log('Vérification des contrats...');
    
    // Vérifier si la table contracts existe
    const hasContractsTable = await db.schema.hasTable('contracts');
    console.log('Table contracts existe:', hasContractsTable);
    
    if (hasContractsTable) {
      const contracts = await db('contracts').select('*');
      console.log('Contrats trouvés:', contracts.length);
      console.log(contracts);
    }
    
    // Vérifier aussi la table alerts
    const hasAlertsTable = await db.schema.hasTable('alerts');
    console.log('\nTable alerts existe:', hasAlertsTable);
    
    if (hasAlertsTable) {
      const alerts = await db('alerts').select('*');
      console.log('Alertes trouvées:', alerts.length);
      console.log(alerts);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await db.destroy();
  }
}

checkContracts();
