require('dotenv').config();
const knex = require('knex');
const knexConfig = require('./knexfile.cjs');
const path = require('path');

async function updateEtagesTable() {
  console.log('Démarrage de la mise à jour de la table etages...');
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
    const hasTenantId = await db.schema.hasColumn('etages', 'tenant_id');
    const hasAgentId = await db.schema.hasColumn('etages', 'agent_id');
    
    if (hasTenantId && hasAgentId) {
      console.log('Les colonnes tenant_id et agent_id existent déjà dans la table etages');
      return;
    }
    
    // Ajouter les colonnes manquantes
    if (!hasTenantId) {
      console.log('Ajout de la colonne tenant_id...');
      await db.schema.alterTable('etages', (table) => {
        table.integer('tenant_id')
          .unsigned()
          .nullable()
          .references('id')
          .inTable('users')
          .onDelete('SET NULL')
          .comment('Référence au locataire de l\'étage');
      });
      console.log('Colonne tenant_id ajoutée avec succès');
    }
    
    if (!hasAgentId) {
      console.log('Ajout de la colonne agent_id...');
      await db.schema.alterTable('etages', (table) => {
        table.integer('agent_id')
          .unsigned()
          .nullable()
          .references('id')
          .inTable('users')
          .onDelete('SET NULL')
          .comment('Référence à l\'agent responsable de l\'étage');
      });
      console.log('Colonne agent_id ajoutée avec succès');
    }
    
    // Vérifier la structure de la table
    const columns = await db('etages').columnInfo();
    console.log('\nStructure de la table etages :');
    console.log(Object.keys(columns).join(', '));
    
    console.log('\nMise à jour terminée avec succès !');
    
  } catch (error) {
    console.error('\nErreur lors de la mise à jour :', error);
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

// Exécuter la mise à jour
updateEtagesTable();
