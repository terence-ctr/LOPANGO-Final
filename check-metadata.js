import knex from 'knex';
import knexConfig from './knexfile.js';

// Initialize knex
const db = knex(knexConfig.development);

async function checkEquipmentLabels() {
  console.log('Connecting to the database to check equipment labels...');
  try {
    const equipments = await db('property_equipments').select('value', 'label');
    
    if (equipments.length === 0) {
      console.log('The property_equipments table is empty.');
      return;
    }

    console.log('--- Equipment Labels in Database ---');
    equipments.forEach(eq => {
      console.log(`Value: ${eq.value}, Label: ${eq.label}`);
    });
    console.log('------------------------------------');

  } catch (error) {
    console.error('Error fetching equipment labels:', error);
  } finally {
    // Ensure the database connection is closed
    await db.destroy();
    console.log('Database connection closed.');
  }
}

checkEquipmentLabels();
