// Configuration de la migration personnalisée
import knex from 'knex';
import knexfile from './knexfile.js';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
const environment = process.env.NODE_ENV || 'development';
const config = {
  ...knexfile[environment],
  // S'assurer que les chemins sont résolus correctement
  migrations: {
    ...knexfile[environment].migrations,
    directory: `${__dirname}/${knexfile[environment].migrations.directory}`
  },
  seeds: {
    ...knexfile[environment].seeds,
    directory: `${__dirname}/${knexfile[environment].seeds.directory}`
  }
};

// Créer les dossiers nécessaires s'ils n'existent pas
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// S'assurer que les dossiers existent
ensureDirectoryExists(config.migrations.directory);
ensureDirectoryExists(config.seeds.directory);

async function runMigrations() {
  console.log('Démarrage des migrations...');
  const db = knex(config);
  
  try {
    // Vérifier la connexion à la base de données
    await db.raw('SELECT 1');
    console.log('✅ Connexion à la base de données établie');
    
    // Créer la table des migrations si elle n'existe pas
    const migrationsExist = await db.schema.hasTable('knex_migrations');
    if (!migrationsExist) {
      console.log('Création de la table des migrations...');
      await db.migrate.make('initial');
    }
    
    // Exécuter les migrations
    console.log('Recherche de nouvelles migrations...');
    const [batchNo, log] = await db.migrate.latest();
    
    if (log.length === 0) {
      console.log('✅ Aucune nouvelle migration à exécuter');
    } else {
      console.log(`✅ Migrations exécutées avec succès (lot #${batchNo}):`);
      log.forEach(file => console.log(`   - ${file}`));
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
