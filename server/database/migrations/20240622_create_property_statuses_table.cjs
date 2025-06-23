/** @type {import('knex').Knex} */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function(knex) {
  // Créer la table property_statuses
  await knex.schema.createTable('property_statuses', (table) => {
    table.increments('id').primary();
    table.string('value').notNullable().unique();
    table.string('label').notNullable();
    table.string('color').nullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('display_order').defaultTo(0);
    table.timestamps(true, true);
  });

  // Insérer les statuts par défaut avec des couleurs
  const statuses = [
    { value: 'DISPONIBLE', label: 'Disponible', color: '#10B981' }, // Vert
    { value: 'LOUE', label: 'Loué', color: '#3B82F6' }, // Bleu
    { value: 'MAINTENANCE', label: 'En maintenance', color: '#F59E0B' }, // Jaune
    { value: 'INACTIF', label: 'Inactif', color: '#6B7280' } // Gris
  ];

  for (const [index, status] of statuses.entries()) {
    await knex('property_statuses').insert({
      ...status,
      display_order: index + 1,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // Créer la table currencies
  await knex.schema.createTable('currencies', (table) => {
    table.increments('id').primary();
    table.string('code', 3).notNullable().unique();
    table.string('name').notNullable();
    table.string('symbol').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('display_order').defaultTo(0);
    table.timestamps(true, true);
  });

  // Insérer les devises par défaut
  const currencies = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GBP', name: 'Livre Sterling', symbol: '£' },
    { code: 'FC', name: 'Franc Congolais', symbol: 'FC' },
    { code: 'FCFA', name: 'Franc CFA', symbol: 'FCFA' }
  ];

  for (const [index, currency] of currencies.entries()) {
    await knex('currencies').insert({
      ...currency,
      display_order: index + 1,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function(knex) {
  await knex.schema.dropTableIfExists('currencies');
  await knex.schema.dropTableIfExists('property_statuses');
};

exports.up = up;
exports.down = down;
