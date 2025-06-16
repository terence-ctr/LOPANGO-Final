import knex from 'knex';
import knexfile from './knexfile.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de l'environnement
const environment = process.env.NODE_ENV || 'development';
const config = {
  ...knexfile[environment],
  // S'assurer que les chemins sont résolus correctement
  migrations: {
    ...knexfile[environment].migrations,
    directory: path.resolve(__dirname, knexfile[environment].migrations.directory)
  },
  seeds: {
    ...knexfile[environment].seeds,
    directory: path.resolve(__dirname, knexfile[environment].seeds.directory)
  }
};

async function runMigration() {
  console.log('Démarrage de la migration...');
  
  // Créer une instance Knex
  const db = knex(config);
  
  try {
    // Vérifier la connexion à la base de données
    await db.raw('SELECT 1');
    console.log('✅ Connexion à la base de données établie');
    
    // Créer la table des migrations si elle n'existe pas
    const migrationsTableExists = await db.schema.hasTable('knex_migrations');
    if (!migrationsTableExists) {
      console.log('Création de la table des migrations...');
      await db.migrate.init();
    }
    
    // Forcer l'exécution des migrations
    console.log('Exécution des migrations...');
    
    // D'abord, réinitialiser toutes les migrations
    await db.migrate.rollback({}, true);
    console.log('✅ Anciennes migrations annulées');
    
    // Puis exécuter toutes les migrations disponibles
    const [batchNo, log] = await db.migrate.latest();
    
    if (log.length === 0) {
      console.log('❌ Aucune migration trouvée dans le répertoire des migrations');
      console.log('Vérifiez que le chemin des migrations est correct :', config.migrations.directory);
    } else {
      console.log(`✅ ${log.length} migration(s) exécutée(s) avec succès (lot #${batchNo}):`);
      log.forEach(file => console.log(`   - ${file}`));
      
      // Vérifier que les tables ont été créées
      const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'knex_migrations'");
      console.log('\nTables créées dans la base de données :');
      tables.forEach(table => console.log(`   - ${table.name}`));
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:');
    console.error(error);
    process.exit(1);
  } finally {
    // Fermer la connexion
    await db.destroy();
  }
}

// Exécuter la migration
runMigration().catch(console.error);
