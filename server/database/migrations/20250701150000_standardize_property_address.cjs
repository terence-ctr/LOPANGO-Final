/**
 * Migration pour standardiser le format d'adresse des propriétés
 * - Supprime les champs obsolètes (quartier, commune)
 * - S'assure que les champs d'adresse sont correctement formatés
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Vérifier si la table properties existe
  const hasTable = await knex.schema.hasTable('properties');
  
  if (!hasTable) {
    console.log('La table properties n\'existe pas, migration non nécessaire');
    return;
  }

  // Vérifier si les colonnes existent avant de les supprimer
  const hasQuartier = await knex.schema.hasColumn('properties', 'quartier');
  const hasCommune = await knex.schema.hasColumn('properties', 'commune');

  // Supprimer les colonnes obsolètes si elles existent
  if (hasQuartier || hasCommune) {
    console.log('Suppression des colonnes obsolètes (quartier, commune)');
    
    // Désactiver temporairement les contraintes de clé étrangère si nécessaire
    if (knex.client.config.client === 'sqlite3') {
      await knex.raw('PRAGMA foreign_keys=off');
    }
    
    // Supprimer les colonnes
    if (hasQuartier) {
      await knex.schema.table('properties', table => {
        table.dropColumn('quartier');
      });
    }
    
    if (hasCommune) {
      await knex.schema.table('properties', table => {
        table.dropColumn('commune');
      });
    }
    
    // Réactiver les contraintes de clé étrangère
    if (knex.client.config.client === 'sqlite3') {
      await knex.raw('PRAGMA foreign_keys=on');
    }
  }

  // S'assurer que les colonnes d'adresse existent avec le bon type
  await knex.schema.alterTable('properties', table => {
    // Si la colonne address n'existe pas, la créer
    if (!knex.schema.hasColumn('properties', 'address')) {
      table.string('address').notNullable().defaultTo('');
    } else {
      table.string('address').notNullable().defaultTo('').alter();
    }
    
    // S'assurer que les autres colonnes d'adresse existent
    if (!knex.schema.hasColumn('properties', 'city')) {
      table.string('city').notNullable().defaultTo('');
    } else {
      table.string('city').notNullable().defaultTo('').alter();
    }
    
    if (!knex.schema.hasColumn('properties', 'postal_code')) {
      table.string('postal_code').notNullable().defaultTo('');
    } else {
      table.string('postal_code').notNullable().defaultTo('').alter();
    }
    
    if (!knex.schema.hasColumn('properties', 'country')) {
      table.string('country').notNullable().defaultTo('congo');
    } else {
      table.string('country').notNullable().defaultTo('congo').alter();
    }
  });
  
  console.log('Structure d\'adresse standardisée avec succès');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Cette migration est principalement destructive (suppression de colonnes)
  // La méthode down ne peut pas restaurer les données supprimées
  
  // Vérifier si la table properties existe
  const hasTable = await knex.schema.hasTable('properties');
  if (!hasTable) return;
  
  // Ajouter à nouveau les colonnes (mais sans les données d'origine)
  await knex.schema.alterTable('properties', table => {
    if (!knex.schema.hasColumn('properties', 'quartier')) {
      table.string('quartier').nullable();
    }
    
    if (!knex.schema.hasColumn('properties', 'commune')) {
      table.string('commune').nullable();
    }
  });
  
  console.log('Colonnes obsolètes rajoutées (sans les données d\'origine)');
};

// Pour le support TypeScript
module.exports = exports;
