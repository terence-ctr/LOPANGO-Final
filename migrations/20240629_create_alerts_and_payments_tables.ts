import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Création de la table des alertes
  await knex.schema.createTable('alerts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('type').notNullable(); // payment, maintenance, document, etc.
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.enum('priority', ['low', 'medium', 'high', 'critical']).defaultTo('medium');
    table.boolean('isRead').defaultTo(false);
    
    // Relations
    table.uuid('propertyId').references('id').inTable('properties').onDelete('CASCADE');
    table.uuid('contractId').references('id').inTable('contracts').onDelete('CASCADE');
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE');
    
    // Timestamps
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    
    // Index
    table.index(['userId', 'isRead']);
    table.index(['propertyId', 'isRead']);
    table.index(['contractId', 'isRead']);
  });

  // Création de la table des paiements
  await knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('EUR');
    table.enum('status', ['pending', 'completed', 'failed', 'refunded', 'partially_refunded']).defaultTo('pending');
    table.string('paymentMethod').notNullable(); // bank_transfer, credit_card, etc.
    table.string('reference').notNullable();
    table.text('description').nullable();
    
    // Relations
    table.uuid('propertyId').references('id').inTable('properties').onDelete('CASCADE');
    table.uuid('contractId').references('id').inTable('contracts').onDelete('SET NULL');
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE');
    
    // Dates
    table.timestamp('paymentDate').defaultTo(knex.fn.now());
    table.timestamp('dueDate').nullable();
    
    // Timestamps
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    
    // Index
    table.index(['userId', 'status']);
    table.index(['propertyId', 'status']);
    table.index(['contractId', 'status']);
    table.index(['reference']);
  });
  
  // Ajout d'une contrainte unique sur la référence de paiement
  await knex.schema.raw('CREATE UNIQUE INDEX payments_reference_unique ON payments(reference)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('alerts');
}
