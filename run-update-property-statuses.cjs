require('dotenv').config();
const knex = require('knex');
const knexConfig = require('./knexfile.cjs');
const path = require('path');

async function runMigration() {
  console.log('Démarrage de la mise à jour des statuts de propriété...');
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
    
    // Vérifier si la colonne existe déjà
    const hasColumn = await db.schema.hasColumn('property_statuses', 'is_available');
    
    if (hasColumn) {
      console.log('La colonne is_available existe déjà dans la table property_statuses');
      return;
    }
    
    // Ajouter la colonne is_available
    console.log('Ajout de la colonne is_available...');
    await db.schema.alterTable('property_statuses', (table) => {
      table.boolean('is_available').defaultTo(true).comment('Indique si ce statut permet la location du bien');
    });
    
    // Mettre à jour les statuts existants
    console.log('Mise à jour des statuts existants...');
    await db('property_statuses')
      .update({ is_available: false })
      .whereIn('value', ['LOUE', 'MAINTENANCE', 'INACTIF']);
    
    // Afficher les statuts mis à jour
    const statuses = await db('property_statuses').select('*');
    console.log('\nStatuts mis à jour :');
    statuses.forEach(status => {
      console.log(`- ${status.label} (${status.value}): ${status.is_available ? 'Disponible' : 'Non disponible'}`);
    });
    
    console.log('\nMigration terminée avec succès !');
    
  } catch (error) {
    console.error('\nErreur lors de la migration :', error);
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

// Exécuter la migration
runMigration();
