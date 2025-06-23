import knex from 'knex';
import knexConfig from './knexfile.js';

async function checkDatabase() {
  const db = knex(knexConfig.development);
  
  try {
    // List all tables
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables in database:');
    console.log(tables);
    
    // Check property_types table
    try {
      const propertyTypes = await db('property_types').select('*');
      console.log('\nProperty Types:');
      console.log(propertyTypes);
    } catch (err) {
      console.log('\nError querying property_types:', err.message);
    }
    
    // Check property_statuses table
    try {
      const propertyStatuses = await db('property_statuses').select('*');
      console.log('\nProperty Statuses:');
      console.log(propertyStatuses);
    } catch (err) {
      console.log('\nError querying property_statuses:', err.message);
    }
    
    // Check property_equipments table
    try {
      const propertyEquipments = await db('property_equipments').select('*');
      console.log('\nProperty Equipments:');
      console.log(propertyEquipments);
    } catch (err) {
      console.log('\nError querying property_equipments:', err.message);
    }
    
    // Check currencies table
    try {
      const currencies = await db('currencies').select('*');
      console.log('\nCurrencies:');
      console.log(currencies);
    } catch (err) {
      console.log('\nError querying currencies:', err.message);
    }
    
    // Check properties table structure
    try {
      const propertiesColumns = await db('properties').columnInfo();
      console.log('\nStructure de la table properties:');
      console.log(propertiesColumns);
      
      // Check if street column exists and is required
      const streetColumn = propertiesColumns.find(col => col.name === 'street');
      if (streetColumn) {
        console.log('\nColonne street:');
        console.log(`- Type: ${streetColumn.type}`);
        console.log(`- Nullable: ${streetColumn.nullable === 0 ? 'Oui' : 'Non'}`);
        console.log(`- Valeur par défaut: ${streetColumn.default || 'Aucune'}`);
      } else {
        console.log('\nLa colonne street n\'existe pas dans la table properties');
      }
    } catch (err) {
      console.log('\nError querying properties table structure:', err.message);
    }
    
  } catch (err) {
    console.error('Error checking database:', err);
  } finally {
    await db.destroy();
  }
}

checkDatabase();
