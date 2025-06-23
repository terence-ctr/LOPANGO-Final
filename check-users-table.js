import knex from 'knex';
import knexConfig from './knexfile.js';

const config = knexConfig.development;
const db = knex(config);

async function checkUsersTable() {
  try {
    const columns = await db.raw('PRAGMA table_info(users)');
    console.log('Colonnes de la table users :');
    console.table(columns);
    
    // Vérifier si les colonnes problématiques existent déjà
    const existingColumns = columns.map(col => col.name);
    const problemColumns = [
      'accepted_privacy_policy',
      'accepted_privacy_policy_at',
      'accepted_terms',
      'accepted_terms_at',
      'email_verification_expire',
      'email_verification_token',
      'mfa_enabled'
    ];
    
    console.log('\nColonnes problématiques déjà présentes :');
    problemColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`- ${col} (existe déjà)`);
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification de la table users :', error);
  } finally {
    await db.destroy();
  }
}

checkUsersTable();
