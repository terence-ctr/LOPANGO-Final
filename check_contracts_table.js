import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { verbose } = sqlite3;
const sqlite3Verbose = verbose();

// Chemin vers la base de données SQLite
const dbPath = join(__dirname, 'server', 'database', 'lopango_dev.sqlite3');
const db = new sqlite3Verbose.Database(dbPath);

console.log('Vérification de la structure de la table contracts...\n');

// Vérifier les colonnes de la table contracts
db.all('PRAGMA table_info(contracts)', (err, columns) => {
  if (err) {
    console.error('Erreur lors de la récupération des colonnes de la table contracts:', err);
    db.close();
    return;
  }

  console.log('Colonnes de la table contracts:');
  console.log('--------------------------------');
  columns.forEach(col => {
    console.log(`${String(col.name).padEnd(20)} | Type: ${String(col.type).padEnd(10)} | Nullable: ${col.notnull === 0 ? 'Oui' : 'Non'} | Default: ${col.dflt_value || 'NULL'}`);
  });

  // Vérifier si agent_id existe
  const hasAgentId = columns.some(col => col.name === 'agent_id');
  console.log('\nVérification du champ agent_id:');
  console.log('--------------------------------');
  console.log(`Le champ agent_id ${hasAgentId ? 'existe' : 'n\'existe pas'} dans la table contracts`);

  // Vérifier les contraintes de clé étrangère
  db.all("PRAGMA foreign_key_list(contracts)", (fkErr, fkList) => {
    if (fkErr) {
      console.error('Erreur lors de la récupération des clés étrangères:', fkErr);
      db.close();
      return;
    }

    console.log('\nContraintes de clé étrangère:');
    console.log('--------------------------------');
    if (fkList && fkList.length > 0) {
      fkList.forEach(fk => {
        console.log(`Colonne: ${fk.from} → Table: ${fk.table}.${fk.to}`);
      });
    } else {
      console.log('Aucune contrainte de clé étrangère trouvée.');
    }

    db.close();
  });
});
