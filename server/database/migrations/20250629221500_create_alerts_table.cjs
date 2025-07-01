const TABLE_NAME = 'alerts';

exports.up = function(knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.string('type').notNullable(); // PAYMENT, MAINTENANCE, DOCUMENT, etc.
    table.string('status').defaultTo('NEW'); // NEW, IN_PROGRESS, RESOLVED, DISMISSED
    
    // Références
    table.integer('property_id').unsigned().references('id').inTable('properties').onDelete('CASCADE');
    table.integer('contract_id').unsigned().references('id').inTable('contracts').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Métadonnées
    table.jsonb('metadata').defaultTo('{}');
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Index pour les recherches courantes
    table.index(['user_id', 'status']);
    table.index(['type', 'status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
