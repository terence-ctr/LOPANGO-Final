/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .dropTableIfExists('knex_migrations')
    .then(() => {
      return knex.schema.createTable('knex_migrations', table => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.integer('batch').notNullable();
        table.timestamp('migration_time', { useTz: true }).defaultTo(knex.fn.now());
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function() {
  // Ne rien faire, on ne peut pas annuler cette migration
  return Promise.resolve();
};
