/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Supprimer les contraintes de clé étrangère existantes
  await knex.schema.alterTable('addresses', table => {
    table.dropForeign('user_id');
  });

  await knex.schema.alterTable('identities', table => {
    table.dropForeign('user_id');
  });

  // Ajouter les nouvelles colonnes à la table users
  await knex.schema.alterTable('users', table => {
    table.integer('address_id').unsigned().nullable();
    table.integer('identity_id').unsigned().nullable();
    
    // Ajouter les contraintes de clé étrangère
    table.foreign('address_id').references('id').inTable('addresses').onDelete('SET NULL');
    table.foreign('identity_id').references('id').inTable('identities').onDelete('SET NULL');
  });

  // Mettre à jour les contraintes des tables existantes
  await knex.schema.alterTable('addresses', table => {
    table.integer('user_id').unsigned().nullable().alter();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });

  await knex.schema.alterTable('identities', table => {
    table.integer('user_id').unsigned().nullable().alter();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Supprimer les nouvelles contraintes
  await knex.schema.alterTable('users', table => {
    table.dropForeign('address_id');
    table.dropForeign('identity_id');
    table.dropColumn('address_id');
    table.dropColumn('identity_id');
  });

  // Rétablir les contraintes d'origine
  await knex.schema.alterTable('addresses', table => {
    table.dropForeign('user_id');
    table.integer('user_id').unsigned().notNullable().alter();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });

  await knex.schema.alterTable('identities', table => {
    table.dropForeign('user_id');
    table.integer('user_id').unsigned().notNullable().alter();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
};
