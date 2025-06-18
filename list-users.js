import knex from 'knex';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './server/database/lopango_dev.sqlite3'
  },
  useNullAsDefault: true
});

async function listUsers() {
  try {
    const users = await db('users').select('id', 'email', 'first_name', 'last_name');
    console.log('Utilisateurs existants :');
    console.table(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
  } finally {
    await db.destroy();
  }
}

listUsers();
