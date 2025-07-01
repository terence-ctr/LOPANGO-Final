/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('contracts', function(table) {
    table.string('currency').defaultTo('USD');
    table.decimal('deposit', 10, 2).defaultTo(0);
    table.string('duration').notNullable();
    table.date('start_date').notNullable();
    table.date('end_date');
    table.string('status').defaultTo('draft');
    table.text('special_conditions');
    table.integer('landlord_id').unsigned().references('id').inTable('users');
    table.integer('tenant_id').unsigned().references('id').inTable('users');
    table.integer('property_id').unsigned().references('id').inTable('properties');
    table.decimal('rent', 10, 2).notNullable();
    // La colonne 'usage' est déjà ajoutée par une migration précédente
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('contracts', function(table) {
    table.dropColumn('currency');
    table.dropColumn('deposit');
    table.dropColumn('duration');
    table.dropColumn('start_date');
    table.dropColumn('end_date');
    table.dropColumn('status');
    table.dropColumn('special_conditions');
    table.dropColumn('landlord_id');
    table.dropColumn('tenant_id');
    table.dropColumn('property_id');
    table.dropColumn('rent');
  });
};
