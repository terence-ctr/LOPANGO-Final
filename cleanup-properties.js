import knex from 'knex';
import knexConfig from './knexfile.js';
const config = knexConfig.development;
const db = knex(config);

async function cleanupPropertiesTable() {
  try {
    // Désactiver les contraintes de clé étrangère (si nécessaire pour SQLite)
    await db.raw('PRAGMA foreign_keys = OFF');
    
    // Démarrer une transaction
    await db.transaction(async (trx) => {
      console.log('Début du nettoyage de la table properties...');
      
      // 1. Vérifier si la table properties existe
      const tableExists = await trx.schema.hasTable('properties');
      if (!tableExists) {
        throw new Error('La table properties n\'existe pas');
      }
      
      // 2. Créer une nouvelle table avec la structure souhaitée
      await trx.raw(`
        CREATE TABLE IF NOT EXISTS properties_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          owner_id INTEGER,
          tenant_id INTEGER,
          title varchar(255) NOT NULL,
          description TEXT,
          type TEXT NOT NULL,
          address TEXT,
          city varchar(255),
          postal_code varchar(20),
          country varchar(255),
          area INTEGER,
          rooms INTEGER DEFAULT 1,
          bathrooms INTEGER DEFAULT 1,
          floor varchar(50) DEFAULT '0',
          furnished BOOLEAN DEFAULT 0,
          equipment TEXT DEFAULT '[]',
          has_elevator BOOLEAN DEFAULT 0,
          has_parking BOOLEAN DEFAULT 0,
          has_balcony BOOLEAN DEFAULT 0,
          has_terrace BOOLEAN DEFAULT 0,
          has_garden BOOLEAN DEFAULT 0,
          has_pool BOOLEAN DEFAULT 0,
          has_air_conditioning BOOLEAN DEFAULT 0,
          has_heating BOOLEAN DEFAULT 0,
          year_built INTEGER,
          rent DECIMAL(10, 2),
          charges DECIMAL(10, 2) DEFAULT 0,
          deposit DECIMAL(10, 2) DEFAULT 0,
          currency varchar(3) DEFAULT 'EUR',
          status TEXT DEFAULT 'BROUILLON',
          is_active BOOLEAN DEFAULT 1,
          is_featured BOOLEAN DEFAULT 0,
          available_from DATE,
          published_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      
      // 3. Vérifier les données existantes
      const existingData = await trx('properties').select('*').limit(1);
      console.log('Exemple de données existantes:', existingData[0]);
      
      // 4. Copier les données de l'ancienne table vers la nouvelle
      await trx.raw(`
        INSERT INTO properties_new (
          id, owner_id, tenant_id, title, description, type,
          address, city, postal_code, country, area,
          rooms, bathrooms, floor, furnished, equipment, has_elevator,
          has_parking, has_balcony, has_terrace, has_garden, has_pool,
          has_air_conditioning, has_heating, year_built, rent, charges,
          deposit, currency, status, is_active, is_featured, available_from,
          published_at, created_at, updated_at
        )
        SELECT 
          id, 
          owner_id, 
          tenant_id, 
          COALESCE(title, '') as title, 
          COALESCE(description, '') as description, 
          COALESCE(type, 'APPARTEMENT') as type,
          TRIM(COALESCE(address, '') || ' ' || COALESCE(street, '')) as address, 
          COALESCE(city, '') as city, 
          postal_code, 
          COALESCE(country, '') as country, 
          COALESCE(area, 0) as area,
          COALESCE(rooms, 1) as rooms, 
          COALESCE(bathrooms, 1) as bathrooms, 
          COALESCE(floor, '0') as floor, 
          COALESCE(furnished, 0) as furnished, 
          COALESCE(equipment, '[]') as equipment, 
          COALESCE(has_elevator, 0) as has_elevator,
          COALESCE(has_parking, 0) as has_parking, 
          COALESCE(has_balcony, 0) as has_balcony, 
          COALESCE(has_terrace, 0) as has_terrace, 
          COALESCE(has_garden, 0) as has_garden, 
          COALESCE(has_pool, 0) as has_pool,
          COALESCE(has_air_conditioning, 0) as has_air_conditioning, 
          COALESCE(has_heating, 0) as has_heating, 
          year_built, 
          COALESCE(rent, 0) as rent, 
          COALESCE(charges, 0) as charges,
          COALESCE(deposit, 0) as deposit, 
          COALESCE(currency, 'EUR') as currency, 
          COALESCE(status, 'BROUILLON') as status, 
          COALESCE(is_active, 1) as is_active, 
          COALESCE(is_featured, 0) as is_featured, 
          available_from,
          published_at, 
          COALESCE(created_at, CURRENT_TIMESTAMP) as created_at, 
          COALESCE(updated_at, CURRENT_TIMESTAMP) as updated_at
        FROM properties
      `);
      
      // 5. Vérifier les données copiées
      const newData = await trx('properties_new').select('*').limit(1);
      console.log('Exemple de données après nettoyage:', newData[0]);
      
      // 6. Supprimer l'ancienne table
      await trx.schema.dropTableIfExists('properties');
      
      // 7. Renommer la nouvelle table
      await trx.schema.renameTable('properties_new', 'properties');
      
      // 8. Créer les index
      await trx.schema.table('properties', (table) => {
        table.index('owner_id');
        table.index('tenant_id');
        table.index('type');
        table.index('status');
        table.index('city');
        table.index('is_featured');
      });
      
      console.log('✅ Nettoyage de la table properties terminé avec succès !');
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la table properties:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Réactiver les contraintes de clé étrangère
    await db.raw('PRAGMA foreign_keys = ON');
    await db.destroy();
  }
}

// Exécuter le nettoyage
const runCleanup = async () => {
  try {
    await cleanupPropertiesTable();
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors de l\'exécution du script:', err);
    process.exit(1);
  }
};

runCleanup();
