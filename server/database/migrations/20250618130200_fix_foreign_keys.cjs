/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Vérifier si la table users existe
  const hasUsersTable = await knex.schema.hasTable('users');
  const hasAddressesTable = await knex.schema.hasTable('addresses');
  const hasIdentitiesTable = await knex.schema.hasTable('identities');
  
  if (!hasUsersTable || !hasAddressesTable || !hasIdentitiesTable) {
    console.log('Certaines tables nécessaires n\'existent pas. Arrêt de la migration.');
    return;
  }

  // Obtenir les colonnes existantes de la table users
  const usersColumns = await knex.raw('PRAGMA table_info(users)');
  const usersColumnNames = usersColumns.map(col => col.name);

  // Vérifier et ajouter les colonnes manquantes dans la table users
  await knex.schema.alterTable('users', table => {
    if (!usersColumnNames.includes('address_id')) {
      table.integer('address_id').unsigned().nullable();
    }
    if (!usersColumnNames.includes('identity_id')) {
      table.integer('identity_id').unsigned().nullable();
    }
  });

  // Vérifier et ajouter les contraintes de clé étrangère si elles n'existent pas
  const foreignKeys = await knex.raw('PRAGMA foreign_key_list(users)');
  const hasAddressFk = foreignKeys.some(fk => fk.from === 'address_id');
  const hasIdentityFk = foreignKeys.some(fk => fk.from === 'identity_id');

  if (!hasAddressFk) {
    await knex.schema.alterTable('users', table => {
      table.foreign('address_id').references('id').inTable('addresses').onDelete('SET NULL');
    });
  }

  if (!hasIdentityFk) {
    await knex.schema.alterTable('users', table => {
      table.foreign('identity_id').references('id').inTable('identities').onDelete('SET NULL');
    });
  }

  // Mettre à jour les contraintes des tables existantes
  if (hasAddressesTable) {
    await knex.schema.alterTable('addresses', async table => {
      // Vérifier si la colonne user_id existe avant de la modifier
      const addressColumns = await knex.raw('PRAGMA table_info(addresses)');
      const hasUserIdColumn = addressColumns.some(col => col.name === 'user_id');
      
      if (hasUserIdColumn) {
        table.integer('user_id').unsigned().nullable().alter();
        // Supprimer d'abord la contrainte existante si elle existe
        try {
          await knex.raw('PRAGMA foreign_keys=OFF');
          await knex.schema.alterTable('addresses', t => {
            t.dropForeign('user_id');
          });
          await knex.raw('PRAGMA foreign_keys=ON');
        } catch (error) {
          console.log('Erreur lors de la suppression de la contrainte existante:', error.message);
        }
        
        // Ajouter la nouvelle contrainte
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      }
    });
  }

  if (hasIdentitiesTable) {
    await knex.schema.alterTable('identities', async table => {
      // Vérifier si la colonne user_id existe avant de la modifier
      const identityColumns = await knex.raw('PRAGMA table_info(identities)');
      const hasUserIdColumn = identityColumns.some(col => col.name === 'user_id');
      
      if (hasUserIdColumn) {
        table.integer('user_id').unsigned().nullable().alter();
        // Supprimer d'abord la contrainte existante si elle existe
        try {
          await knex.raw('PRAGMA foreign_keys=OFF');
          await knex.schema.alterTable('identities', t => {
            t.dropForeign('user_id');
          });
          await knex.raw('PRAGMA foreign_keys=ON');
        } catch (error) {
          console.log('Erreur lors de la suppression de la contrainte existante:', error.message);
        }
        
        // Ajouter la nouvelle contrainte
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      }
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Supprimer les nouvelles contraintes
  await knex.schema.alterTable('users', table => {
    table.dropForeign('address_id');
    table.dropForeign('identity_id');
    table.dropColumn('address_id');
    table.dropColumn('identity_id');
  });

  // Rétablir les contraintes d'origine
  await knex.schema.alterTable('addresses', table => {
    table.dropForeign('user_id');
    table.integer('user_id').unsigned().notNullable().alter();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });

  await knex.schema.alterTable('identities', table => {
    table.dropForeign('user_id');
    table.integer('user_id').unsigned().notNullable().alter();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
};
