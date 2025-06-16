import { db } from '../server/database';

async function checkGenderConstraint() {
  try {
    // 1. Vérifier la structure de la table users
    const tableInfo = await db.raw(`
      SELECT sql 
      FROM sqlite_master 
      WHERE type='table' AND name='users'
    `);
    
    console.log('=== Définition complète de la table users ===');
    console.log(tableInfo[0].sql);

    // 2. Vérifier les contraintes sur la colonne gender
    const constraints = await db.raw(`
      SELECT * 
      FROM pragma_table_info('users') 
      WHERE name = 'gender'
    `);
    
    console.log('\n=== Contraintes sur la colonne gender ===');
    console.log(constraints);

    // 3. Tester les valeurs possibles
    console.log('\n=== Test des valeurs possibles ===');
    const testValues = ['male', 'female', 'other', 'Male', 'Female', 'Other', 'M', 'F', 'O'];
    
    for (const value of testValues) {
      try {
        // Créer une table temporaire avec la même contrainte
        await db.raw('DROP TABLE IF EXISTS temp_test_gender');
        await db.raw(`
          CREATE TEMPORARY TABLE temp_test_gender (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gender TEXT CHECK(gender IN ('male', 'female', 'other'))
          )
        `);
        
        // Tester l'insertion
        await db('temp_test_gender').insert({ gender: value });
        console.log(`✅ '${value}' est une valeur valide`);
      } catch (error) {
        console.error(`❌ '${value}' est invalide:`, error.message);
      }
    }

  } catch (error) {
    console.error('Erreur lors de la vérification des contraintes:', error);
  } finally {
    await db.destroy();
  }
}

checkGenderConstraint();
