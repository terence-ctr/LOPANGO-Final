// knexfile.cjs
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './server/database/lopango_dev.sqlite3'
    },
    migrations: {
      directory: './server/database/migrations',
      extension: 'cjs',
      loadExtensions: ['.cjs', '.js']
    },
    seeds: {
      directory: './server/database/seeds'
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, cb) => {
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
      directory: './server/database/migrations',
      extension: 'cjs',
      loadExtensions: ['.cjs', '.js']
    },
    seeds: {
      directory: './server/database/seeds'
    },
    useNullAsDefault: true
  },
  
  production: {
    client: 'sqlite3',
    connection: {
      filename: './server/database/lopango_prod.sqlite3'
    },
    migrations: {
      directory: './server/database/migrations',
      extension: 'cjs',
      loadExtensions: ['.cjs', '.js']
    },
    seeds: {
      directory: './server/database/seeds'
    },
    useNullAsDefault: true
  }
};
