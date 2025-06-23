import { Knex } from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données
// Configuration type for Knex
interface KnexConfig extends Knex.Config {
  [key: string]: any;
}

const config: { [key: string]: KnexConfig } = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, './server/database/lopango_dev.sqlite3')
    },
    migrations: {
      directory: path.join(__dirname, './server/database/migrations'),
      extension: 'ts',
      loadExtensions: ['.ts', '.js', '.cjs'],
      disableMigrationsListValidation: true,
      tableName: 'knex_migrations',
      schemaName: 'public',
      disableMigrationsListValidation: true
    },
    seeds: {
      directory: path.join(__dirname, './server/database/seeds'),
      extension: 'ts',
      loadExtensions: ['.ts']
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn: any, cb: any) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    },
    debug: true
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    migrations: {
      directory: path.join(__dirname, './server/database/migrations'),
      extension: 'ts',
      loadExtensions: ['.ts']
    },
    seeds: {
      directory: path.join(__dirname, './server/database/seeds'),
      extension: 'ts',
      loadExtensions: ['.ts']
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn: any, cb: any) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, './server/database/lopango_prod.sqlite3')
    },
    migrations: {
      directory: path.join(__dirname, './server/database/migrations'),
      extension: 'js',
      loadExtensions: ['.js']
    },
    seeds: {
      directory: path.join(__dirname, './server/database/seeds'),
      extension: 'js',
      loadExtensions: ['.js']
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn: any, cb: any) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  }
};

export default config;
