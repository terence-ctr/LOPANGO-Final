import dotenv from 'dotenv';
import knexPackage from 'knex';
import knexfile from './knexfile.js';

dotenv.config();
const knex = knexPackage(knexfile.development);

async function runMigration() {
  try {
    console.log('Démarrage de la migration...');
    
    // Vérifie si la table etages existe déjà
    const etagesExists = await knex.schema.hasTable('etages');
    
    if (!etagesExists) {
      // Création de la table etages
      await knex.schema.createTable('etages', (table) => {
        table.increments('id').primary().comment('Identifiant unique');
        table.string('libelle', 50).notNullable().comment('Nom de l\'étage/niveau');
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
      });
      console.log('Table etages créée avec succès');
    } else {
      console.log('La table etages existe déjà');
    }

    // Vérifie si les colonnes existent déjà dans properties
    const hasAgentId = await knex.schema.hasColumn('properties', 'agent_id');
    const hasEtageId = await knex.schema.hasColumn('properties', 'etage_id');

    if (!hasAgentId) {
      await knex.schema.alterTable('properties', (table) => {
        table.integer('agent_id')
          .unsigned()
          .nullable()
          .references('id')
          .inTable('users')
          .onDelete('SET NULL')
          .comment('Agent responsable de la propriété');
      });
      console.log('Colonne agent_id ajoutée à la table properties');
    }

    if (!hasEtageId) {
      await knex.schema.alterTable('properties', (table) => {
        table.integer('etage_id')
          .unsigned()
          .nullable()
          .references('id')
          .inTable('etages')
          .onDelete('SET NULL')
          .comment('Étage/Niveau de la propriété');
      });
      console.log('Colonne etage_id ajoutée à la table properties');
    }

    // Vérifie si la colonne existe déjà dans contracts
    const hasContractAgentId = await knex.schema.hasColumn('contracts', 'agent_id');

    if (!hasContractAgentId) {
      await knex.schema.alterTable('contracts', (table) => {
        table.integer('agent_id')
          .unsigned()
          .nullable()
          .references('id')
          .inTable('users')
          .onDelete('SET NULL')
          .comment('Agent responsable du contrat');
      });
      console.log('Colonne agent_id ajoutée à la table contracts');
    }

    // Vérifie si des étages existent déjà
    const etagesCount = await knex('etages').count('* as count').first();
    
    if (parseInt(etagesCount.count) === 0) {
      // Insérez les étages par défaut
      const defaultEtages = [
        { libelle: 'Rez-de-chaussée' },
        { libelle: '1er étage' },
        { libelle: '2ème étage' },
        { libelle: '3ème étage' },
        { libelle: '4ème étage' },
        { libelle: '5ème étage' },
        { libelle: '6ème étage' },
        { libelle: '7ème étage et plus' },
        { libelle: 'Sous-sol' },
        { libelle: 'RDC surélevé' },
        { libelle: 'Dernier étage' },
        { libelle: 'Mezzanine' }
      ];

      await knex('etages').insert(defaultEtages);
      console.log('Étages par défaut insérés avec succès');
    } else {
      console.log('Des étages existent déjà dans la table etages');
    }

    console.log('Migration appliquée avec succès !');
  } catch (error) {
    console.error('Erreur lors de la migration :', error);
    process.exit(1);
  } finally {
    await knex.destroy();
  }
}

runMigration().catch(console.error);
