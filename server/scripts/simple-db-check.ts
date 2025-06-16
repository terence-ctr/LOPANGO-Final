import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel dans les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkDb() {
  const dbPath = path.resolve(__dirname, '../../data/database.sqlite');
  console.log('Chemin de la base de données:', dbPath);
  
  try {
    // Ouvrir la base de données
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('Connexion à la base de données réussie!');
    
    // Récupérer la liste des tables
    const tables = await db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    
    console.log('Tables trouvées:', tables);
    
    if (tables.length === 0) {
      console.log('Aucune table trouvée dans la base de données.');
    } else {
      // Vérifier si la table users existe
      const usersTable = tables.find(t => t.name === 'users');
      console.log('Table users trouvée?', usersTable ? 'Oui' : 'Non');
      
      // Afficher la structure de la table users si elle existe
      if (usersTable) {
        const columns = await db.all(`PRAGMA table_info(users)`);
        console.log('Structure de la table users:', columns);
      }
    }
    
    await db.close();
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
  }
}

checkDb();
