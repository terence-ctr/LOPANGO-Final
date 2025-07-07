/**
 * Migration pour ajouter les champs agent_id et etage_id à la table properties,
 * créer la table etages et ajouter le champ agent_id à la table contracts
 */

const TABLE_NAME = 'etages';

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.up = async function(knex) {
  // Création de la table etages
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary().comment('Identifiant unique');
    table.string('libelle', 50).notNullable().comment('Nom de l\'étage/niveau');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Ajout de la colonne agent_id à la table properties
  await knex.schema.table('properties', (table) => {
    table.integer('agent_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .comment('Agent responsable de la propriété');

    table.integer('etage_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('etages')
      .onDelete('SET NULL')
      .comment('Étage/Niveau de la propriété');
  });

  // Ajout de la colonne agent_id à la table contracts
  await knex.schema.table('contracts', (table) => {
    table.integer('agent_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .comment('Agent responsable du contrat');
  });

  // Insertion des étages par défaut
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

  await knex(TABLE_NAME).insert(defaultEtages);
};

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.down = async function(knex) {
  // Suppression des colonnes ajoutées
  await knex.schema.table('properties', (table) => {
    table.dropForeign('agent_id');
    table.dropColumn('agent_id');
    table.dropForeign('etage_id');
    table.dropColumn('etage_id');
  });

  await knex.schema.table('contracts', (table) => {
    table.dropForeign('agent_id');
    table.dropColumn('agent_id');
  });

  // Suppression de la table etages
  await knex.schema.dropTableIfExists(TABLE_NAME);
};

// Ajout de la configuration pour le linter
/** @type {import('knex').Knex.Config} */
const config = {};

exports.config = config;
