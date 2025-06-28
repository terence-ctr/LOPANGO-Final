/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('properties', function(table) {
    table.string('quartier').after('address');
    table.string('commune').after('quartier');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('properties', function(table) {
    table.dropColumn('commune');
    table.dropColumn('quartier');
  });
};
