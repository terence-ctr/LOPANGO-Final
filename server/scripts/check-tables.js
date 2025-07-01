// Script pour vérifier les tables dans la base de données
import db from '../database';

async function checkTables() {
  try {
    console.log('Vérification des tables...');
    
    // Vérifier si la table contracts existe
    const hasContracts = await db.schema.hasTable('contracts');
    console.log('Table contracts existe:', hasContracts);
    
    if (hasContracts) {
      // Obtenir les informations sur les colonnes
      const columns = await db('contracts').columnInfo();
      console.log('Colonnes de contracts:', JSON.stringify(columns, null, 2));
      
      // Compter les entrées
      const count = await db('contracts').count('* as count').first();
      console.log('Nombre de contrats:', count?.count);
    }
    
    // Vérifier les autres tables importantes
    const tables = ['users', 'properties'];
    for (const table of tables) {
      const exists = await db.schema.hasTable(table);
      console.log(`Table ${table} existe:`, exists);
      
      if (exists) {
        const cols = await db(table).columnInfo();
        console.log(`Colonnes de ${table}:`, Object.keys(cols).join(', '));
      }
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
  } finally {
    // Ne pas fermer la connexion pour ne pas affecter les autres requêtes
    // await db.destroy();
  }
}

// Exécuter la vérification
checkTables().then(() => {
  console.log('Vérification terminée');  
  process.exit(0);
}).catch(error => {
  console.error('Erreur:', error);
  process.exit(1);
});
