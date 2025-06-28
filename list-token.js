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
    const users = await db('users').select('id', 'user_type', 'first_name', 'last_name', 'email', 'is_active', 'email_verified', 'created_at', 'updated_at', 'address', 'identity', 'properties', 'refresh_tokens');
    console.log('users de rafraîchissement existants :');
    console.table(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des users de rafraîchissement :', error);
  } finally {
    await db.destroy();
  }
}

listUsers();