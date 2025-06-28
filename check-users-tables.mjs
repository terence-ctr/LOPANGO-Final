import knex from 'knex';

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
    if (Array.isArray(tables) && tables.length > 0) {
      tables.forEach(table => {
        console.log(`- ${table.name}`);
      });
    } else {
      console.log('Aucune table trouvée');
    }

    // Vérifier la structure de la table users
    console.log('\n\nStructure de la table properties:');
    const columns = await db.raw(`
      PRAGMA table_info(properties)
    `);
    console.log('Colonne | Type | Null | Clé | Défaut | Extra');
    console.log('--------|------|------|-----|--------|-------');
    if (Array.isArray(columns) && columns.length > 0) {
      columns.forEach(column => {
        console.log(
          `${column.name} | ${column.type} | ${column.notnull ? 'NO' : 'YES'} | ${column.pk ? 'YES' : 'NO'} | ${column.dflt_value} | ${column.pk ? 'PRIMARY KEY' : ''}`
        );
      });
    }

    // Vérifier les données dans la table users
    console.log('\n\nDonnées dans la table properties:');
    const properties = await db('properties').select('*');
    if (Array.isArray(properties)) {
      console.log(JSON.stringify(properties, null, 2));
    } else {
      console.log('Aucune propriété trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
  } finally {
    // Fermer la connexion à la base de données
    await db.destroy();
  }
}

checkTables();
