import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, 'data', 'database.sqlite'),
  logging: false
});

async function verifyDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...');
    
    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    // Voir toutes les tables
    const [tables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    console.log('\n📋 Tables dans la base de données:');
    console.table(tables);
    
    // Vérifier si la table users existe
    if (tables.some(t => t.name === 'users')) {
      console.log('\n🔍 Structure de la table users:');
      const [columns] = await sequelize.query('PRAGMA table_info(users)');
      console.table(columns);
      
      // Compter le nombre d'utilisateurs
      const [count] = await sequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n👥 Nombre d'utilisateurs: ${count[0].count}`);
    }
    
    // Vérifier les migrations exécutées
    if (tables.some(t => t.name === 'SequelizeMeta')) {
      console.log('\n🔍 Migrations exécutées:');
      const [migrations] = await sequelize.query('SELECT * FROM SequelizeMeta');
      console.table(migrations);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la base de données:');
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

verifyDatabase().catch(console.error);
