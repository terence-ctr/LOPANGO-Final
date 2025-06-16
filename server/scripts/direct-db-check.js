import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const { verbose } = sqlite3;
const sqlite = verbose();

// Obtenir le chemin du répertoire actuel dans les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers la base de données
const dbPath = path.resolve(__dirname, '../../data/database.sqlite');
console.log('Chemin de la base de données:', dbPath);

// Ouvrir la base de données
const db = new sqlite.Database(dbPath, sqlite.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
    return;
  }
  console.log('Connecté à la base de données SQLite.');
  
  // Lister toutes les tables
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, tables) => {
    if (err) {
      console.error('Erreur lors de la récupération des tables:', err.message);
      return;
    }
    
    console.log('Tables trouvées:');
    console.table(tables);
    
    // Si la table users existe, afficher sa structure
    const usersTable = tables.find(t => t.name === 'users');
    if (usersTable) {
      console.log('\nStructure de la table users:');
      db.all("PRAGMA table_info(users)", [], (err, columns) => {
        if (err) {
          console.error('Erreur lors de la récupération de la structure de la table users:', err.message);
          return;
        }
        console.table(columns);
      });
    } else {
      console.log('La table users n\'existe pas.');
    }
  });
});

// Gérer la fermeture du processus
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Erreur lors de la fermeture de la base de données:', err.message);
    } else {
      console.log('Connexion à la base de données fermée.');
    }
    process.exit(0);
  });
});
