/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('etages', (table) => {
      table.increments('id').primary();
      table.string('libelle', 100).notNullable().comment('Nom ou numéro de l\'étage (ex: RDC, 1er étage, etc.)');
      table.integer('niveau').notNullable().comment('Niveau numérique (0 pour RDC, 1 pour 1er étage, etc.)');
      
      // Nouveaux champs
      table.string('status', 50).nullable()
        .comment('Statut de l\'étage: disponible, occupe, en_renovation, hors_service');
      table.integer('nombre_appartements').unsigned().defaultTo(0)
        .comment('Nombre d\'appartements sur cet étage');
      
      // Références aux autres tables
      table.integer('tenant_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .comment('Référence au locataire de l\'étage');
        
      table.integer('agent_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .comment('Référence à l\'agent responsable de l\'étage');
        
      table.timestamps(true, true);
      table.timestamp('deleted_at').nullable();
      
      // Contraintes
      table.unique(['libelle', 'deleted_at'], 'idx_etages_libelle_unique');
    })
    .then(() => {
      // Ajouter des triggers pour la validation du statut (nécessaire pour SQLite)
      return knex.raw(`
        CREATE TRIGGER IF NOT EXISTS check_etage_status 
        BEFORE INSERT ON etages
        BEGIN
          SELECT
            CASE
              WHEN NEW.status NOT IN ('disponible', 'occupe', 'en_renovation', 'hors_service') THEN
                RAISE(ABORT, 'Statut invalide. Doit être: disponible, occupe, en_renovation ou hors_service')
            END;
        END;
      `);
    })
    .then(() => {
      return knex.raw(`
        CREATE TRIGGER IF NOT EXISTS check_etage_status_update 
        BEFORE UPDATE ON etages
        BEGIN
          SELECT
            CASE
              WHEN NEW.status NOT IN ('disponible', 'occupe', 'en_renovation', 'hors_service') THEN
                RAISE(ABORT, 'Statut invalide. Doit être: disponible, occupe, en_renovation ou hors_service')
            END;
        END;
      `);
    })
    .then(() => {
      // Ajouter la colonne etage_id à la table properties
      return knex.schema.alterTable('properties', (table) => {
        table.integer('etage_id')
          .unsigned()
          .nullable()
          .references('id')
          .inTable('etages')
          .onDelete('SET NULL')
          .comment('Référence à l\'étage du bien');
      });
    })
    .then(() => {
      // Insérer les étages par défaut
      return knex('etages').insert([
        { libelle: 'Sous-sol', niveau: -1 },
        { libelle: 'Rez-de-chaussée', niveau: 0 },
        { libelle: '1er étage', niveau: 1 },
        { libelle: '2ème étage', niveau: 2 },
        { libelle: '3ème étage', niveau: 3 },
        { libelle: '4ème étage', niveau: 4 },
        { libelle: '5ème étage', niveau: 5 },
        { libelle: '6ème étage et plus', niveau: 6 }
      ]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .alterTable('properties', (table) => {
      table.dropForeign('etage_id');
      table.dropColumn('etage_id');
    })
    .then(() => {
      return knex.schema.dropTableIfExists('etages');
    });
};
