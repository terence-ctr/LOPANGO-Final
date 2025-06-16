import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const commonConfig = {
  client: 'sqlite3',
  useNullAsDefault: true,
  migrations: {
    directory: './server/database/migrations',
    tableName: 'knex_migrations',
    loadExtensions: ['.cjs'],
    extension: 'cjs'
  },
  seeds: {
    directory: './server/database/seeds',
    loadExtensions: ['.cjs'],
    extension: 'cjs'
  },
  pool: {
    afterCreate: (conn, done) => {
      conn.run('PRAGMA foreign_keys = ON', done);
    }
  }
};

export default {
  development: {
    ...commonConfig,
    connection: {
      filename: process.env.DATABASE_URL || './server/database/lopango_dev.sqlite3'
    }
  },
  
  test: {
    ...commonConfig,
    connection: {
      filename: './server/database/test.sqlite3'
    }
  },
  
  production: {
    ...commonConfig,
    connection: {
      filename: process.env.DATABASE_URL || './server/database/lopango_prod.sqlite3'
    }
  }
};
