import knex from 'knex';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, './server/database/lopango_dev.sqlite3')
  },
  useNullAsDefault: true
};

async function resetMigrations() {
  const db = knex(config);
  
  try {
    // Supprimer la table des migrations si elle existe
    await db.schema.dropTableIfExists('knex_migrations');
    
    // Recréer la table des migrations
    await db.schema.createTable('knex_migrations', table => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.integer('batch').notNullable();
      table.timestamp('migration_time').defaultTo(db.fn.now());
    });
    
    console.log('Table des migrations réinitialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des migrations:', error);
  } finally {
    await db.destroy();
  }
}

resetMigrations();
