/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function(knex) {
  // Vérifier et créer la table users
  const usersExists = await knex.schema.hasTable('users');
  if (!usersExists) {
    await knex.schema.createTable('users', function (table) {
      table.increments('id').primary();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('phone').notNullable();
      table.date('date_of_birth').notNullable();
      table.enum('gender', ['male', 'female', 'other']).notNullable();
      table.enum('user_type', ['tenant', 'landlord', 'agent', 'admin']).notNullable();
      table.boolean('email_verified').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.datetime('last_login');
      table.timestamps(true, true);
    });
    console.log('Table users créée avec succès');
  } else {
    console.log('La table users existe déjà');
  }

  // Vérifier et créer la table addresses
  const addressesExists = await knex.schema.hasTable('addresses');
  if (!addressesExists) {
    await knex.schema.createTable('addresses', function (table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('street').notNullable();
      table.string('city').notNullable();
      table.string('postal_code').notNullable();
      table.string('country').notNullable();
      table.text('additional_info');
      table.timestamps(true, true);
    });
    console.log('Table addresses créée avec succès');
  } else {
    console.log('La table addresses existe déjà');
  }

  // Vérifier et créer la table identities
  const identitiesExists = await knex.schema.hasTable('identities');
  if (!identitiesExists) {
    await knex.schema.createTable('identities', function (table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.enum('document_type', ['permis_conduire', 'passeport', 'carte_identite']).notNullable();
      table.string('national_id').notNullable();
      table.string('document_front_url');
      table.string('document_back_url');
      table.boolean('verified').defaultTo(false);
      table.datetime('verified_at');
      table.integer('verified_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
      table.text('verification_comment');
      table.timestamps(true, true);
    });
    console.log('Table identities créée avec succès');
  } else {
    console.log('La table identities existe déjà');
  }

  // Vérifier et créer la table refresh_tokens
  const refreshTokensExists = await knex.schema.hasTable('refresh_tokens');
  if (!refreshTokensExists) {
    await knex.schema.createTable('refresh_tokens', function (table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('token').notNullable().unique();
      table.datetime('expires_at').notNullable();
      table.boolean('revoked').defaultTo(false);
      table.datetime('revoked_at');
      table.string('replaced_by_token');
      table.string('ip_address');
      table.text('user_agent');
      table.timestamps(true, true);
    });
    console.log('Table refresh_tokens créée avec succès');
  } else {
    console.log('La table refresh_tokens existe déjà');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function(knex) {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('identities');
  await knex.schema.dropTableIfExists('addresses');
  await knex.schema.dropTableIfExists('users');
};

// Utilisation de module.exports pour CommonJS
module.exports = { up, down };
