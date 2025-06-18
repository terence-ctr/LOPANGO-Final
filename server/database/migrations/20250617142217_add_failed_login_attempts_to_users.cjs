/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
module.exports.up = async function(knex) {
  // Vérifier si la colonne failed_login_attempts existe déjà
  const hasFailedLoginAttempts = await knex.schema.hasColumn('users', 'failed_login_attempts');
  
  if (!hasFailedLoginAttempts) {
    await knex.schema.alterTable('users', (table) => {
      table.integer('failed_login_attempts').defaultTo(0);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
module.exports.down = async function(knex) {
  // Supprimer la colonne failed_login_attempts si elle existe
  if (await knex.schema.hasColumn('users', 'failed_login_attempts')) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('failed_login_attempts');
    });
  }
};
