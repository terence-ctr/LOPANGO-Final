require('dotenv').config();
const knex = require('knex');
const knexConfig = require('./knexfile.cjs');
const path = require('path');

async function runMigration() {
  console.log('Démarrage de la création de la table des étages...');
  let db;
  
  try {
    // Créer une instance Knex avec la configuration de développement
    const config = {
      ...knexConfig.development,
      connection: {
        ...knexConfig.development.connection,
        filename: path.resolve(process.env.DATABASE_URL || knexConfig.development.connection.filename)
      }
    };
    
    db = knex(config);
    
    // Vérifier si la table etages existe déjà
    const tableExists = await db.schema.hasTable('etages');
    
    if (tableExists) {
      console.log('La table etages existe déjà');
      return;
    }
    
    console.log('Création de la table etages...');
    await db.schema.createTable('etages', (table) => {
      table.increments('id').primary();
      table.string('libelle', 100).notNullable().comment("Nom ou numéro de l'étage (ex: RDC, 1er étage, etc.)");
      table.integer('niveau').notNullable().comment('Niveau numérique (0 pour RDC, 1 pour 1er étage, etc.)');
      
      // Nouveaux champs
      table.string('status', 50).nullable()
        .comment('Statut de l\'étage: disponible, occupe, en_renovation, hors_service');
      table.integer('nombre_appartements').unsigned()
        .comment('Nombre d\'appartements sur cet étage');
      
      // Références aux autres tables
      table.integer('tenant_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .comment('Référence au locataire de l\'étage');
        
      table.integer('agent_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .comment('Référence à l\'agent responsable de l\'étage');
        
      table.timestamps(true, true);
      table.timestamp('deleted_at').nullable();
      
      // Contraintes
      table.unique(['libelle', 'deleted_at'], 'idx_etages_libelle_unique');
      
      // Pas de contrainte CHECK pour SQLite qui a des problèmes avec les apostrophes
      // La validation se fera au niveau de l'application
    });
    
    // Ajouter une vérification manuelle pour SQLite
    await db.raw(`
      CREATE TRIGGER check_etage_status 
      BEFORE INSERT ON etages
      BEGIN
        SELECT
          CASE
            WHEN NEW.status NOT IN ('disponible', 'occupe', 'en_renovation', 'hors_service') THEN
              RAISE(ABORT, 'Statut invalide. Doit être: disponible, occupe, en_renovation ou hors_service')
          END;
      END;
    `);
    
    // Ajouter le même trigger pour les mises à jour
    await db.raw(`
      CREATE TRIGGER check_etage_status_update 
      BEFORE UPDATE ON etages
      BEGIN
        SELECT
          CASE
            WHEN NEW.status NOT IN ('disponible', 'occupe', 'en_renovation', 'hors_service') THEN
              RAISE(ABORT, 'Statut invalide. Doit être: disponible, occupe, en_renovation ou hors_service')
          END;
      END;
    `);
    
    console.log('Ajout de la colonne etage_id à la table properties...');
    await db.schema.alterTable('properties', (table) => {
      table.integer('etage_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('etages')
        .onDelete('SET NULL')
        .comment("Référence à l'étage du bien");
    });
    
    console.log('Insertion des étages par défaut...');
    await db('etages').insert([
      { libelle: 'Sous-sol', niveau: -1 },
      { libelle: 'Rez-de-chaussée', niveau: 0 },
      { libelle: '1er étage', niveau: 1 },
      { libelle: '2ème étage', niveau: 2 },
      { libelle: '3ème étage', niveau: 3 },
      { libelle: '4ème étage', niveau: 4 },
      { libelle: '5ème étage', niveau: 5 },
      { libelle: '6ème étage et plus', niveau: 6 }
    ]);
    
    // Afficher les étages créés
    const etages = await db('etages').select('*').orderBy('niveau', 'asc');
    console.log('\nÉtages créés :');
    etages.forEach(etage => {
      console.log(`- ${etage.libelle} (niveau ${etage.niveau})`);
    });
    
    console.log('\nMigration terminée avec succès !');
    
  } catch (error) {
    console.error('\nErreur lors de la migration :', error);
    process.exit(1);
  } finally {
    // Fermer la connexion à la base de données
    if (db) {
      await db.destroy();
      console.log('\nConnexion à la base de données fermée.');
    }
    process.exit(0);
  }
}

// Exécuter la migration
runMigration();
