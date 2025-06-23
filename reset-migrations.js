import knex from 'knex';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./knexfile.cjs');

async function() {
  const db = knex(config.development);
  
  try {
    // Supprimer la table des migrations si elle existe
    await db.schema.dropTableIfExists('knex_migrations');
    
    // Recréer la table des migrations
    await db.schema.createTable('knex_migrations', table => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.integer('batch').notNullable();
      table.timestamp('migration_time', { useTz: true }).defaultTo(db.fn.now());
    });
    
    console.log('Table des migrations réinitialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des migrations:', error);
  } finally {
    await db.destroy();
  }
}

resetMigrations();
