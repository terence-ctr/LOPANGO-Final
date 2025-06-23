/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasPropertiesTable = await knex.schema.hasTable('properties');
  
  if (!hasPropertiesTable) {
    await knex.schema.createTable('properties', function(table) {
      // Identifiant unique
      table.increments('id').primary();
      
      // Référence au propriétaire
      table.integer('owner_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      
      // Informations de base
      table.string('title').notNullable();
      table.text('description');
      table.enum('type', ['T1', 'T2', 'T3', 'T4+', 'MAISON', 'APPARTEMENT', 'BUREAU', 'COMMERCE', 'AUTRE']).notNullable();
      table.enum('status', ['DISPONIBLE', 'LOUE', 'MAINTENANCE', 'INACTIF']).defaultTo('DISPONIBLE');
      
      // Adresse
      table.string('address').notNullable();
      table.string('city').notNullable();
      table.string('postal_code', 20).notNullable();
      table.string('country').defaultTo('France');
      table.decimal('latitude', 10, 8);
      table.decimal('longitude', 11, 8);
      
      // Caractéristiques
      table.integer('area').notNullable().comment('Superficie en m²');
      table.integer('rooms').notNullable().defaultTo(1);
      table.integer('bathrooms').notNullable().defaultTo(1);
      table.string('floor').defaultTo('0');
      table.boolean('furnished').defaultTo(false);
      
      // Équipements
      table.json('equipment').defaultTo('[]');
      table.boolean('has_elevator').defaultTo(false);
      table.boolean('has_parking').defaultTo(false);
      table.boolean('has_balcony').defaultTo(false);
      table.boolean('has_terrace').defaultTo(false);
      table.boolean('has_garden').defaultTo(false);
      table.boolean('has_pool').defaultTo(false);
      table.boolean('has_air_conditioning').defaultTo(false);
      table.boolean('has_heating').defaultTo(false);
      
      // Informations financières
      table.decimal('rent', 10, 2);
      table.decimal('charges', 10, 2).defaultTo(0);
      table.decimal('deposit', 10, 2);
      table.string('currency', 3).defaultTo('EUR');
      
      // Autres
      table.integer('year_built');
      table.boolean('is_featured').defaultTo(false);
      table.timestamp('available_from');
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    
    console.log('Table properties créée avec succès');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('properties');
};
