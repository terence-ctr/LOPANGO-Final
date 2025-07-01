/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Créer une nouvelle table avec la colonne metadata en TEXT
  await knex.schema.raw(`
    CREATE TABLE alerts_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'NEW',
      property_id INTEGER,
      contract_id INTEGER,
      user_id INTEGER NOT NULL,
      metadata TEXT DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Copier les données de l'ancienne table vers la nouvelle
  await knex.schema.raw(`
    INSERT INTO alerts_new (
      id, title, message, type, status, property_id, 
      contract_id, user_id, metadata, created_at, updated_at
    ) SELECT 
      id, title, message, type, status, property_id, 
      contract_id, user_id, json(metadata) as metadata, created_at, updated_at 
    FROM alerts
  `);

  // Supprimer l'ancienne table et renommer la nouvelle
  await knex.schema.dropTable('alerts');
  await knex.schema.renameTable('alerts_new', 'alerts');

  // Recréer les index
  await knex.schema.table('alerts', (table) => {
    table.index(['user_id', 'status']);
    table.index(['type', 'status']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // En cas de rollback, recréer la table avec le type jsonb
  await knex.schema.raw(`
    CREATE TABLE alerts_old (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'NEW',
      property_id INTEGER,
      contract_id INTEGER,
      user_id INTEGER NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Copier les données
  await knex.schema.raw(`
    INSERT INTO alerts_old (
      id, title, message, type, status, property_id, 
      contract_id, user_id, metadata, created_at, updated_at
    ) SELECT * FROM alerts
  `);

  // Remplacer la table
  await knex.schema.dropTable('alerts');
  await knex.schema.renameTable('alerts_old', 'alerts');

  // Recréer les index
  await knex.schema.table('alerts', (table) => {
    table.index(['user_id', 'status']);
    table.index(['type', 'status']);
  });
};
