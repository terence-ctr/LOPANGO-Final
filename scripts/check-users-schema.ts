import { db } from '../server/database';

async function checkUsersSchema() {
  try {
    console.log('Vérification de la structure de la table users...');
    
    // Vérifier si la table users existe
    const hasUsersTable = await db.schema.hasTable('users');
    
    if (!hasUsersTable) {
      console.log('La table users n\'existe pas dans la base de données.');
      return;
    }

    // Obtenir les informations sur les colonnes
    const columns = await db('users').columnInfo();
    console.log('\n=== Colonnes de la table users ===');
    console.log(columns);

    // Obtenir la définition complète de la table
    const tableInfo = await db.raw(`
      SELECT sql 
      FROM sqlite_master 
      WHERE type='table' AND name='users'
    `);
    
    console.log('\n=== Définition complète de la table ===');
    console.log(tableInfo[0].sql);

    // Vérifier les valeurs uniques dans la colonne gender
    try {
      const genderValues = await db('users')
        .select('gender')
        .groupBy('gender');
        
      console.log('\n=== Valeurs uniques dans la colonne gender ===');
      console.log(genderValues);
    } catch (error) {
      console.log('\nImpossible de récupérer les valeurs de la colonne gender:', error.message);
    }

  } catch (error) {
    console.error('Erreur lors de la vérification du schéma:', error);
  } finally {
    // Fermer la connexion
    await db.destroy();
    process.exit(0);
  }
}

checkUsersSchema();
