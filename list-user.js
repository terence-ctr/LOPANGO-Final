import knex from 'knex';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './server/database/lopango_dev.sqlite3'
  },
  useNullAsDefault: true
});

async function listusers() {
  try {
    const users = await db('users').select('id', 'email', 'user_type', 'password', );
    console.log('Users existants :');
    console.table(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des users :', error);
  } finally {
    await db.destroy();
  }
}

listusers();
