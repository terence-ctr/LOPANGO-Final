const knex = require('knex');

// Configuration de la base de données
const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lopanngo'
  }
});

async function checkTables() {
  try {
    // Vérifier les tables existantes
    const tables = await db.raw('SHOW TABLES');
    console.log('\nTables existantes dans la base de données:');
    tables[0].forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });

    // Vérifier la structure de la table users
    console.log('\n\nStructure de la table users:');
    const columns = await db.raw('DESCRIBE users');
    console.log('Colonne | Type | Null | Clé | Défaut | Extra');
    console.log('--------|------|------|-----|--------|-------');
    columns[0].forEach(column => {
      console.log(
        `${column.Field} | ${column.Type} | ${column.Null} | ${column.Key} | ${column.Default} | ${column.Extra}`
      );
    });

    // Vérifier les données dans la table users
    console.log('\n\nDonnées dans la table users:');
    const users = await db('users').select('*');
    console.log(JSON.stringify(users, null, 2));

  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
  } finally {
    // Fermer la connexion à la base de données
    await db.destroy();
  }
}

checkTables();
