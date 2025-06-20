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
      
      // Référence au locataire (optionnel)
      table.integer('tenant_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
      
      // Informations de base
      table.string('title').notNullable();
      table.text('description');
      table.string('slug').unique();
      table.enum('type', ['T1', 'T2', 'T3', 'T4+', 'MAISON', 'APPARTEMENT', 'BUREAU', 'COMMERCE', 'AUTRE']).notNullable();
      
      // Adresse
      table.string('street').notNullable();
      table.string('city').notNullable();
      table.string('postal_code', 20).notNullable();
      table.string('country').notNullable();
      table.string('full_address').notNullable();
      table.decimal('latitude', 10, 8);
      table.decimal('longitude', 11, 8);
      
      // Caractéristiques
      table.integer('area').notNullable().comment('Superficie en m²');
      table.integer('floor_area').comment('Surface habitable en m²');
      table.integer('land_area').comment('Surface du terrain en m²');
      table.integer('rooms').notNullable().defaultTo(1);
      table.integer('bathrooms').notNullable().defaultTo(1);
      table.string('floor').defaultTo('0');
      table.boolean('furnished').defaultTo(false);
      table.json('equipment').defaultTo('[]');
      table.boolean('has_elevator').defaultTo(false);
      table.boolean('has_parking').defaultTo(false);
      table.boolean('has_balcony').defaultTo(false);
      table.boolean('has_terrace').defaultTo(false);
      table.boolean('has_garden').defaultTo(false);
      table.boolean('has_pool').defaultTo(false);
      table.boolean('has_air_conditioning').defaultTo(false);
      table.boolean('has_heating').defaultTo(false);
      table.integer('year_built');
      
      // Informations financières
      table.decimal('rent', 10, 2).notNullable().comment('Loyer mensuel');
      table.decimal('charges', 10, 2).defaultTo(0).comment('Charges mensuelles');
      table.decimal('deposit', 10, 2).defaultTo(0).comment('Dépôt de garantie');
      table.string('currency', 3).defaultTo('EUR');
      
      // Statut
      table.enum('status', ['DISPONIBLE', 'LOUE', 'EN_ENTRETIEN', 'INDISPONIBLE', 'BROUILLON']).defaultTo('BROUILLON');
      table.boolean('is_active').defaultTo(true);
      table.boolean('is_featured').defaultTo(false);
      table.date('available_from');
      
      // Métadonnées
      table.json('custom_fields').defaultTo('{}');
      
      // Timestamps
      table.timestamp('published_at').nullable();
      table.timestamps(true, true);
      
      // Index pour les recherches courantes
      table.index(['status', 'is_active', 'is_featured']);
      table.index(['city', 'postal_code']);
      table.index('owner_id');
    });
    
    console.log('Table properties créée avec succès');
  } else {
    console.log('La table properties existe déjà');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasPropertiesTable = await knex.schema.hasTable('properties');
  
  if (hasPropertiesTable) {
    await knex.schema.dropTable('properties');
    console.log('Table properties supprimée avec succès');
  } else {
    console.log('La table properties n\'existe pas');
  }
};
