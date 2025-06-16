import { db } from '../server/database';

async function checkSchema() {
  try {
    // Vérifier si la table users existe
    const tableExists = await db.schema.hasTable('users');
    
    if (!tableExists) {
      console.log('La table users n\'existe pas');
      return;
    }

    // Obtenir les informations sur les colonnes
    const columns = await db('users').columnInfo();
    console.log('=== Structure de la table users ===');
    console.log(columns);

    // Obtenir les contraintes de la table
    const constraints = await db.raw(`
      SELECT sql 
      FROM sqlite_master 
      WHERE type='table' AND name='users'
    `);
    
    console.log('\n=== Définition complète de la table ===');
    console.log(constraints[0].sql);

    // Vérifier les valeurs uniques dans la colonne gender
    const genderValues = await db('users')
      .select('gender')
      .groupBy('gender');
      
    console.log('\n=== Valeurs uniques dans la colonne gender ===');
    console.log(genderValues);

  } catch (error) {
    console.error('Erreur lors de la vérification du schéma:', error);
  } finally {
    // Ne pas oublier de fermer la connexion
    await db.destroy();
  }
}

checkSchema();
