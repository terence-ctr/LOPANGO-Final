import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données
const dbPath = path.resolve(__dirname, 'data', 'database.sqlite');
const migrationsPath = path.resolve(__dirname, 'migrations');

// Créer une instance Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
});

async function runMigrations() {
  const transaction = await sequelize.transaction();
  
  try {
    // Créer la table SequelizeMeta si elle n'existe pas
    await sequelize.getQueryInterface().createTable('SequelizeMeta', {
      name: {
        type: 'VARCHAR(255)',
        allowNull: false,
        primaryKey: true,
        unique: true
      }
    }, { transaction });
    
    // Lire les migrations déjà exécutées
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM SequelizeMeta',
      { transaction }
    );
    
    const executedMigrationNames = new Set(executedMigrations.map(m => m.name));
    
    // Lire les fichiers de migration
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js') && !file.endsWith('.d.ts'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Exécuter les migrations non exécutées
    for (const file of migrationFiles) {
      const migrationName = file.replace('.js', '');
      
      if (!executedMigrationNames.has(migrationName)) {
        console.log(`Running migration: ${file}`);
        
        try {
          // Importer la migration en utilisant import()
          const migrationPath = `file://${path.join(migrationsPath, file).replace(/\\/g, '/')}`;
          const migrationModule = await import(migrationPath);
          const migration = migrationModule.default || migrationModule;
          
          if (typeof migration.up !== 'function') {
            throw new Error(`Migration ${file} does not export an 'up' function`);
          }
          
          // Exécuter la migration
          await migration.up(sequelize.getQueryInterface(), Sequelize, { transaction });
          
          // Marquer comme exécutée
          await sequelize.query(
            'INSERT INTO SequelizeMeta (name) VALUES (?)',
            { 
              replacements: [migrationName],
              transaction 
            }
          );
          
          console.log(`✓ ${file} executed successfully`);
        } catch (error) {
          console.error(`❌ Error in migration ${file}:`, error);
          throw error;
        }
      } else {
        console.log(`✓ ${file} already executed, skipping`);
      }
    }
    
    await transaction.commit();
    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed, rolling back...');
    await transaction.rollback();
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Exécuter les migrations
console.log('Starting migrations...');
runMigrations().catch(console.error);
