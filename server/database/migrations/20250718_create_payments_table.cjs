exports.up = function(knex) {
  return knex.schema.createTable('payments', function(table) {
    table.increments('id').primary();
    table.decimal('amount', 12, 2).notNullable();
    table.integer('property_id').unsigned().notNullable().references('id').inTable('properties').onDelete('CASCADE');
    table.integer('agent_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('comment').notNullable();
    table.date('date').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('payments');
}; 