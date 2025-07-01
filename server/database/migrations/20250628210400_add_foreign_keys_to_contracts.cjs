/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('contracts', function(table) {
    // Vérifier que les colonnes existent avant d'ajouter les contraintes
    return Promise.all([
      // Contrainte pour landlord_id
      knex.schema.hasColumn('contracts', 'landlord_id').then(exists => {
        if (exists) {
          return knex.schema.alterTable('contracts', function(t) {
            t.integer('landlord_id').unsigned().references('id').inTable('users').alter();
          });
        }
      }),
      
      // Contrainte pour tenant_id
      knex.schema.hasColumn('contracts', 'tenant_id').then(exists => {
        if (exists) {
          return knex.schema.alterTable('contracts', function(t) {
            t.integer('tenant_id').unsigned().references('id').inTable('users').alter();
          });
        }
      }),
      
      // Contrainte pour property_id
      knex.schema.hasColumn('contracts', 'property_id').then(exists => {
        if (exists) {
          return knex.schema.alterTable('contracts', function(t) {
            t.integer('property_id').unsigned().references('id').inTable('properties').alter();
          });
        }
      })
    ]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('contracts', function(table) {
    return Promise.all([
      // Supprimer la contrainte de clé étrangère pour landlord_id
      knex.schema.hasColumn('contracts', 'landlord_id').then(exists => {
        if (exists) {
          return knex.schema.alterTable('contracts', function(t) {
            t.dropForeign(['landlord_id']);
          });
        }
      }),
      
      // Supprimer la contrainte de clé étrangère pour tenant_id
      knex.schema.hasColumn('contracts', 'tenant_id').then(exists => {
        if (exists) {
          return knex.schema.alterTable('contracts', function(t) {
            t.dropForeign(['tenant_id']);
          });
        }
      }),
      
      // Supprimer la contrainte de clé étrangère pour property_id
      knex.schema.hasColumn('contracts', 'property_id').then(exists => {
        if (exists) {
          return knex.schema.alterTable('contracts', function(t) {
            t.dropForeign(['property_id']);
          });
        }
      })
    ]);
  });
};
