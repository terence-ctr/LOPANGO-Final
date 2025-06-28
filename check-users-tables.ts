import knex from 'knex';
import { Knex } from 'knex';

// Configuration de la base de données
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './server/database/lopango_dev.sqlite3'
  },
  useNullAsDefault: true
});

async function checkTables() {
  try {
    // Vérifier les tables existantes
    const tables = await db.raw(`
      SELECT name FROM sqlite_master 
      WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%'
    `);
    console.log('\nTables existantes dans la base de données:');
    if (Array.isArray(tables[0])) {
      tables[0].forEach(table => {
        console.log(`- ${table.name}`);
      });
    } else {
      console.log('Aucune table trouvée');
    }

    // Vérifier la structure de la table users
    console.log('\n\nStructure de la table users:');
    const columns = await db.raw(`
      PRAGMA table_info(users)
    `);
    console.log('Colonne | Type | Null | Clé | Défaut | Extra');
    console.log('--------|------|------|-----|--------|-------');
    if (Array.isArray(columns[0])) {
      columns[0].forEach(column => {
        console.log(
          `${column.name} | ${column.type} | ${column.notnull ? 'NO' : 'YES'} | ${column.pk ? 'YES' : 'NO'} | ${column.dflt_value} | ${column.pk ? 'PRIMARY KEY' : ''}`
        );
      });
    }

    // Vérifier les données dans la table users
    console.log('\n\nDonnées dans la table users:');
    const users = await db('users').select('*');
    if (Array.isArray(users)) {
      console.log(JSON.stringify(users, null, 2));
    } else {
      console.log('Aucun utilisateur trouvé');
    }

  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
  } finally {
    // Fermer la connexion à la base de données
    await db.destroy();
  }
}

checkTables();
