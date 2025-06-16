import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel dans les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkTables() {
  const dbPath = path.resolve(__dirname, '../../data/database.sqlite');
  console.log('Chemin de la base de données:', dbPath);
  
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: console.log // Activer les logs pour le débogage
  });

  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');

    // Récupérer la liste des tables
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    console.log('Tables dans la base de données:', tables);

    // Vérifier si la table users existe
    const usersTableExists = tables.some((table: any) => table.name === 'users');
    console.log('La table users existe-t-elle ?', usersTableExists ? 'Oui' : 'Non');

    if (usersTableExists) {
      // Afficher la structure de la table users
      const [columns] = await sequelize.query('PRAGMA table_info(users)');
      console.log('Structure de la table users:', columns);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();
