require('dotenv').config();
const knex = require('knex');
const knexConfig = require('./knexfile.cjs');
const path = require('path');

async function runMigration() {
  console.log('Démarrage de la migration des contrats...');
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
    
    // Vérifier si les colonnes existent déjà
    const hasPropertyName = await db.schema.hasColumn('contracts', 'property_name');
    
    if (hasPropertyName) {
      console.log('Les colonnes de propriété existent déjà dans la table contracts');
      return;
    }
    
    console.log('Ajout des colonnes à la table contracts...');
    
    // Ajouter les colonnes
    await db.schema.alterTable('contracts', (table) => {
      table.string('property_name').nullable();
      table.text('property_address').nullable();
      table.string('property_status').defaultTo('active');
    });
    
    console.log('Les colonnes ont été ajoutées avec succès.');
    console.log('Vous pouvez maintenant mettre à jour manuellement les valeurs des nouvelles colonnes.');
    console.log('Colonnes ajoutées: property_name (string), property_address (text), property_status (string)');
    
  } catch (error) {
    console.error('Erreur lors de la migration des contrats:', error);
    process.exit(1);
  } finally {
    if (db) {
      await db.destroy();
    }
  }
}

// Exécuter la migration
runMigration();
