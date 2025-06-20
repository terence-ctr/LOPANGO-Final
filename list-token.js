import knex from 'knex';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './server/database/lopango_dev.sqlite3'
  },
  useNullAsDefault: true
});

async function listRefreshTokens() {
  try {
    const refreshTokens = await db('refresh_tokens').select('id', 'user_id', 'token', 'expires_at', 'created_at', 'updated_at');
    console.log('Tokens de rafraîchissement existants :');
    console.table(refreshTokens);
  } catch (error) {
    console.error('Erreur lors de la récupération des tokens de rafraîchissement :', error);
  } finally {
    await db.destroy();
  }
}

listRefreshTokens();
