import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, 'data', 'database.sqlite'),
  logging: console.log
});

async function checkUsersTable() {
  try {
    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    // Vérifier si la table users existe
    const [usersTable] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    );
    
    if (usersTable.length > 0) {
      console.log('✅ La table users existe.');
      
      // Afficher la structure de la table
      const [tableInfo] = await sequelize.query('PRAGMA table_info(users)');
      console.log('\n📋 Structure de la table users:');
      console.table(tableInfo);
      
      // Compter le nombre d'utilisateurs
      const [count] = await sequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n👥 Nombre d'utilisateurs: ${count[0].count}`);
    } else {
      console.log('❌ La table users n\'existe pas.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la table users:');
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

console.log('Vérification de la table users...');
checkUsersTable().catch(console.error);
