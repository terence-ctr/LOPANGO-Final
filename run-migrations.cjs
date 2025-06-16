const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données
const dbPath = path.resolve(__dirname, 'database.sqlite');
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
          // Importer la migration
          const migration = require(path.join(migrationsPath, file));
          
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
        } catch (migrationError) {
          console.error(`Error executing migration ${file}:`, migrationError);
          throw migrationError;
        }
      }
    }
    
    await transaction.commit();
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed, rolling back...');
    await transaction.rollback();
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Exécuter les migrations
runMigrations().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
