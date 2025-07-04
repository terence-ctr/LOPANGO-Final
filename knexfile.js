import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL || './server/database/lopango_dev.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './server/database/migrations',
      tableName: 'knex_migrations',
      loadExtensions: ['.mjs', '.js', '.cjs']
    },
    seeds: {
      directory: './server/database/seeders',
      loadExtensions: ['.mjs', '.js', '.cjs']
    },
    pool: {
      afterCreate: (conn, done) => {
        // Enable foreign key constraints
        conn.run('PRAGMA foreign_keys = ON', done);
      }
    }
  },
  
  test: {
    client: 'sqlite3',
    connection: {
      filename: './server/database/test.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './server/database/migrations',
      tableName: 'knex_migrations',
      loadExtensions: ['.mjs', '.js', '.cjs']
    },
    seeds: {
      directory: './server/database/seeders',
      loadExtensions: ['.mjs', '.js', '.cjs']
    },
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      }
    }
  },
  
  production: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL || './server/database/lopango_prod.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './server/database/migrations',
      tableName: 'knex_migrations',
      loadExtensions: ['.mjs', '.js', '.cjs']
    },
    seeds: {
      directory: './server/database/seeders',
      loadExtensions: ['.mjs', '.js', '.cjs']
    },
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      }
    }
  }
};
