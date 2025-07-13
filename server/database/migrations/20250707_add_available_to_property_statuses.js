/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('property_statuses', (table) => {
    table.boolean('is_available').defaultTo(true).comment('Indique si ce statut permet la location du bien');
  })
  .then(() => {
    // Mettre à jour les statuts existants
    return knex('property_statuses')
      .update({ is_available: false })
      .whereIn('value', [
        'LOUE',
        'MAINTENANCE',
        'INACTIF'
      ]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('property_statuses', (table) => {
    table.dropColumn('is_available');
  });
};
