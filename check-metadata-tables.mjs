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
    if (Array.isArray(tables[0])) {
      tables[0].forEach(table => {
        console.log(`- ${table.name}`);
      });
    } else {
      console.log('Aucune table trouvée');
    }

    // Vérifier la structure de la table property_types
    console.log('\n\nStructure de la table property_types:');
    const columns = await db.raw(`
      PRAGMA table_info(property_types)
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

    // Vérifier les données dans la table property_types
    console.log('\n\nDonnées dans la table property_types:');
    const types = await db('property_types').select('*');
    if (Array.isArray(types)) {
      console.log(JSON.stringify(types, null, 2));
    } else {
      console.log('Aucun type trouvé');
    }

    // Vérifier la structure de la table property_statuses
    console.log('\n\nStructure de la table property_statuses:');
    const statusColumns = await db.raw(`
      PRAGMA table_info(property_statuses)
    `);
    console.log('Colonne | Type | Null | Clé | Défaut | Extra');
    console.log('--------|------|------|-----|--------|-------');
    if (Array.isArray(statusColumns[0])) {
      statusColumns[0].forEach(column => {
        console.log(
          `${column.name} | ${column.type} | ${column.notnull ? 'NO' : 'YES'} | ${column.pk ? 'YES' : 'NO'} | ${column.dflt_value} | ${column.pk ? 'PRIMARY KEY' : ''}`
        );
      });
    }

    // Vérifier les données dans la table property_statuses
    console.log('\n\nDonnées dans la table property_statuses:');
    const statuses = await db('property_statuses').select('*');
    if (Array.isArray(statuses)) {
      console.log(JSON.stringify(statuses, null, 2));
    } else {
      console.log('Aucun statut trouvé');
    }

    // Vérifier la structure de la table property_equipments
    console.log('\n\nStructure de la table property_equipments:');
    const equipmentColumns = await db.raw(`
      PRAGMA table_info(property_equipments)
    `);
    console.log('Colonne | Type | Null | Clé | Défaut | Extra');
    console.log('--------|------|------|-----|--------|-------');
    if (Array.isArray(equipmentColumns[0])) {
      equipmentColumns[0].forEach(column => {
        console.log(
          `${column.name} | ${column.type} | ${column.notnull ? 'NO' : 'YES'} | ${column.pk ? 'YES' : 'NO'} | ${column.dflt_value} | ${column.pk ? 'PRIMARY KEY' : ''}`
        );
      });
    }

    // Vérifier les données dans la table property_equipments
    console.log('\n\nDonnées dans la table property_equipments:');
    const equipments = await db('property_equipments').select('*');
    if (Array.isArray(equipments)) {
      console.log(JSON.stringify(equipments, null, 2));
    } else {
      console.log('Aucun équipement trouvé');
    }

    // Vérifier la structure de la table currencies
    console.log('\n\nStructure de la table currencies:');
    const currencyColumns = await db.raw(`
      PRAGMA table_info(currencies)
    `);
    console.log('Colonne | Type | Null | Clé | Défaut | Extra');
    console.log('--------|------|------|-----|--------|-------');
    if (Array.isArray(currencyColumns[0])) {
      currencyColumns[0].forEach(column => {
        console.log(
          `${column.name} | ${column.type} | ${column.notnull ? 'NO' : 'YES'} | ${column.pk ? 'YES' : 'NO'} | ${column.dflt_value} | ${column.pk ? 'PRIMARY KEY' : ''}`
        );
      });
    }

    // Vérifier les données dans la table currencies
    console.log('\n\nDonnées dans la table currencies:');
    const currencies = await db('currencies').select('*');
    if (Array.isArray(currencies)) {
      console.log(JSON.stringify(currencies, null, 2));
    } else {
      console.log('Aucune devise trouvée');
    }

  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
  } finally {
    // Fermer la connexion à la base de données
    await db.destroy();
  }
}

checkTables();
