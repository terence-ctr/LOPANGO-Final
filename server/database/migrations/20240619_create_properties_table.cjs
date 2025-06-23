/** @type {import('knex').Knex} */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function(knex) {
  // Vérifier si la table properties existe déjà
  const hasTable = await knex.schema.hasTable('properties');
  
  if (!hasTable) {
    return knex.schema.createTable('properties', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description').nullable();
      table.decimal('price', 10, 2).notNullable();
      table.string('address').notNullable();
      table.string('city').notNullable();
      table.string('postal_code').notNullable();
      table.string('country').notNullable().defaultTo('congo');
      table.string('type').nullable(); // Appartement, Maison, etc.
      table.integer('surface').nullable();
      table.integer('rooms').nullable();
      table.integer('bedrooms').nullable();
      table.integer('bathrooms').nullable();
      table.boolean('furnished').defaultTo(false);
      table.string('status').defaultTo('available'); // available, rented, maintenance, etc.
      
      // Coordonnées GPS
      table.decimal('latitude', 10, 7).nullable();
      table.decimal('longitude', 10, 7).nullable();
      
      // Images (stockées sous forme de tableau JSON ou de chaîne séparée par des virgules)
      table.text('images').nullable();
      
      // Caractéristiques supplémentaires
      table.json('features').nullable();
      
      // Métadonnées
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Clés étrangères
      table.integer('owner_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('tenant_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
      
      // Index
      table.index(['city', 'status']);
      table.index('owner_id');
      table.index('tenant_id');
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = function(knex) {
  return knex.schema.dropTableIfExists('properties');
};

exports.up = up;
exports.down = down;
