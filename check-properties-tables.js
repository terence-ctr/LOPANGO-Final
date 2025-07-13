import knex from 'knex';
import knexConfig from './knexfile.js';

// Use the development configuration from knexfile
const db = knex(knexConfig.development);

async function checkPropertiesTables() {
  try {
    // Vérifier les tables existantes
    console.log('Vérification des tables...');
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table';");
    
    // Afficher toutes les tables
    console.log('\nTables dans la base de données:');
    tables.forEach(table => {
      console.log(`- ${table.name}`);
    });

    // Vérifier spécifiquement la table 'properties'
    const hasPropertiesTable = tables.some(table => table.name === 'properties');
    if (!hasPropertiesTable) {
      console.log("\nERREUR: La table 'properties' n'existe pas !");
      return;
    }
    console.log("\nLa table 'properties' a été trouvée !");

    // Afficher la structure de la table properties
    console.log('\nStructure de la table "properties":');
    const columns = await db.raw('PRAGMA table_info(properties);');
    console.log('Colonne | Type | NotNull | Valeur par défaut | Clé Primaire');
    console.log('--------|------|---------|-------------------|-------------');
    columns.forEach(column => {
      console.log(
        `${column.name.padEnd(8)} | ${String(column.type).padEnd(4)} | ${column.notnull}       | ${String(column.dflt_value || 'NULL').padEnd(17)} | ${column.pk}`
      );
    });

    // Afficher les premières propriétés
    console.log('\nDonnées dans la table "properties":');
    const properties = await db('properties').select('*').limit(10); // Limité à 10 pour la lisibilité
    
    if (properties.length === 0) {
      console.log('Aucune propriété trouvée dans la base de données.');
    } else {
      console.log(`\n${properties.length} propriétés trouvées. Voici les détails :`);
      properties.forEach((prop, index) => {
        console.log(`\n--- Propriété #${index + 1} ---`);
        Object.entries(prop).forEach(([key, value]) => {
          console.log(`${key}: ${value !== null ? value : 'NULL'}`);
        });
      });
    }

    // Vérifier les relations avec d'autres tables
    console.log('\nVérification des relations...');
    const foreignKeys = await db.raw('PRAGMA foreign_key_list(properties);');
    if (foreignKeys.length > 0) {
      console.log('\nClés étrangères trouvées dans la table properties:');
      foreignKeys.forEach(fk => {
        console.log(`- ${fk.from} → ${fk.table}.${fk.to}`);
      });
    } else {
      console.log('Aucune clé étrangère trouvée dans la table properties.');
    }

  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
  } finally {
    // Fermer la connexion à la base de données
    await db.destroy();
  }
}

// Exécuter la fonction principale
checkPropertiesTables();
