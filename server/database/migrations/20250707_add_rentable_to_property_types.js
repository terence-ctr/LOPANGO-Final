/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('property_types', (table) => {
    table.boolean('is_rentable').defaultTo(true).comment('Indique si ce type de bien peut être loué');
  })
  .then(() => {
    // Marquer les types non louables
    return knex('property_types')
      .whereIn('value', [
        'BUREAU',
        'COMMERCE',
        'HOTEL',
        'ENTREPOT',
        'FERME',
        'BATIMENT_INDUSTRIEL'
      ])
      .update({ is_rentable: false });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('property_types', (table) => {
    table.dropColumn('is_rentable');
  });
};
