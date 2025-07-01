/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema.alterTable('contracts', function(table) {
    // Ajouter la colonne payment_day de type integer, nullable
    // Si payment_day est null, cela signifie que le paiement est dû le jour de début de contrat
    table.integer('payment_day').nullable().comment('Jour du mois pour le paiement du loyer');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.alterTable('contracts', function(table) {
    table.dropColumn('payment_day');
  });
};

// Pour la compatibilité avec Knex
export default { up, down };
