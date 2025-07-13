require('dotenv').config();
const knex = require('knex');
const knexConfig = require('./knexfile.cjs');
const path = require('path');

async function dropEtagesTable() {
  console.log('Préparation de la suppression de la table etages...');
  let db;
  
  try {
    // Créer une instance Knex avec la configuration de développement
    const config = {
      ...knexConfig.development,
      connection: {
        ...knexConfig.development.connection,
        filename: path.resolve(process.env.DATABASE_URL || knexConfig.development.connection.filename)
      }
    };
    
    db = knex(config);
    
    // Vérifier si la table properties a une colonne etage_id
    const hasEtageId = await db.schema.hasColumn('properties', 'etage_id');
    
    if (hasEtageId) {
      console.log('Suppression de la contrainte de clé étrangère etage_id de la table properties...');
      await db.schema.alterTable('properties', (table) => {
        table.dropForeign('etage_id');
        table.dropColumn('etage_id');
      });
      console.log('Colonne etage_id supprimée avec succès de la table properties');
    }
    
    // Vérifier si la table etages existe
    const tableExists = await db.schema.hasTable('etages');
    
    if (tableExists) {
      console.log('Suppression de la table etages...');
      await db.schema.dropTable('etages');
      console.log('Table etages supprimée avec succès');
    } else {
      console.log('La table etages n\'existe pas');
    }
    
    console.log('\nNettoyage terminé avec succès !');
    console.log('Vous pouvez maintenant exécuter à nouveau la migration avec: node run-create-etages.cjs');
    
  } catch (error) {
    console.error('\nErreur lors de la suppression :', error);
    process.exit(1);
  } finally {
    // Fermer la connexion à la base de données
    if (db) {
      await db.destroy();
      console.log('\nConnexion à la base de données fermée.');
    }
    process.exit(0);
  }
}

// Exécuter la suppression
dropEtagesTable();
