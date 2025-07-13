import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { verbose } = sqlite3;
const sqlite3Verbose = verbose();

// Chemin vers la base de données SQLite
const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3Verbose.Database(dbPath);

console.log('Vérification des tables dans la base de données...\n');

// Vérifier les tables existantes
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='contracts';", (err, tables) => {
  if (err) {
    console.error('Erreur lors de la vérification des tables:', err);
    db.close();
    return;
  }

  console.log('Tables trouvées dans la base de données:');
  console.log('----------------------------------------');
  
  if (tables && tables.length > 0) {
    tables.forEach(table => {
      console.log(`- ${table.name}`);
    });
    
    // Si la table contracts existe, afficher sa structure
    if (tables.some(t => t.name === 'contracts')) {
      console.log('\nStructure de la table contracts:');
      console.log('----------------------------------------');
      
      db.all('PRAGMA table_info(contracts)', (err, columns) => {
        if (err) {
          console.error('Erreur lors de la récupération de la structure de la table contracts:', err);
        } else if (columns && columns.length > 0) {
          columns.forEach(col => {
            console.log(`${String(col.name).padEnd(20)} | Type: ${String(col.type).padEnd(10)} | Nullable: ${col.notnull === 0 ? 'Oui' : 'Non'} | Default: ${col.dflt_value || 'NULL'}`);
          });
        } else {
          console.log('Aucune colonne trouvée dans la table contracts.');
        }
        db.close();
      });
    } else {
      console.log('\nLa table contracts n\'existe pas dans la base de données.');
      db.close();
    }
  } else {
    console.log('Aucune table trouvée dans la base de données.');
    db.close();
  }
});
