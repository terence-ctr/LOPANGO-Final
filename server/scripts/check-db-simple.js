// Script simple pour vérifier la base de données SQLite
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Chemin vers la base de données SQLite
const dbPath = path.join(__dirname, '..', 'database', 'database.sqlite');
console.log('Chemin de la base de données:', dbPath);

// Vérifier si le fichier de base de données existe
if (!fs.existsSync(dbPath)) {
  console.error('ERREUR: Le fichier de base de données n\'existe pas');
  process.exit(1);
}

// Créer une connexion à la base de données
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.message);
    process.exit(1);
  }
  console.log('Connecté à la base de données SQLite');
  
  // Vérifier les tables
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, tables) => {
    if (err) {
      console.error('Erreur lors de la récupération des tables:', err.message);
      return db.close();
    }
    
    console.log('\n=== TABLES DISPONIBLES ===');
    console.log(tables.map(t => t.name).join(', '));
    
    // Vérifier la table contracts
    if (tables.some(t => t.name === 'contracts')) {
      console.log('\n=== STRUCTURE DE LA TABLE contracts ===');
      db.all('PRAGMA table_info(contracts)', [], (err, columns) => {
        if (err) {
          console.error('Erreur lors de la récupération des colonnes de contracts:', err.message);
        } else {
          console.log('Colonnes de la table contracts:');
          console.table(columns);
        }
        
        // Compter les contrats
        db.get('SELECT COUNT(*) as count FROM contracts', [], (err, row) => {
          if (err) {
            console.error('Erreur lors du comptage des contrats:', err.message);
          } else {
            console.log('Nombre de contrats:', row.count);
          }
          
          // Vérifier la table users
          if (tables.some(t => t.name === 'users')) {
            console.log('\n=== STRUCTURE DE LA TABLE users ===');
            db.all('PRAGMA table_info(users)', [], (err, userColumns) => {
              if (err) {
                console.error('Erreur lors de la récupération des colonnes de users:', err.message);
              } else {
                console.log('Colonnes de la table users:');
                console.table(userColumns);
              }
              
              // Vérifier la table properties
              if (tables.some(t => t.name === 'properties')) {
                console.log('\n=== STRUCTURE DE LA TABLE properties ===');
                db.all('PRAGMA table_info(properties)', [], (err, propColumns) => {
                  if (err) {
                    console.error('Erreur lors de la récupération des colonnes de properties:', err.message);
                  } else {
                    console.log('Colonnes de la table properties:');
                    console.table(propColumns);
                  }
                  
                  // Fermer la connexion
                  db.close();
                });
              } else {
                db.close();
              }
            });
          } else {
            db.close();
          }
        });
      });
    } else {
      db.close();
    }
  });
});
