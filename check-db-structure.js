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

async function checkDatabase() {
  try {
    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    // Voir toutes les tables
    const [tables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    console.log('\n📋 Tables dans la base de données:');
    console.table(tables);
    
    // Voir le contenu de SequelizeMeta
    try {
      const [migrations] = await sequelize.query('SELECT * FROM SequelizeMeta');
      console.log('\n📋 Migrations exécutées:');
      console.table(migrations);
    } catch (error) {
      console.log('\nℹ️ Table SequelizeMeta non trouvée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la base de données:');
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

console.log('Vérification de la base de données...');
checkDatabase().catch(console.error);
