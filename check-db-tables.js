import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkTables() {
  try {
    const dbPath = path.resolve(__dirname, 'data/database.sqlite');
    console.log('Database path:', dbPath);
    
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging: console.log
    });

    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Get all tables
    const [tables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    
    console.log('\nTables in database:');
    console.table(tables);

    // For each table, show its structure and data
    for (const table of tables) {
      console.log(`\nStructure of table ${table.name}:`);
      const [columns] = await sequelize.query(`PRAGMA table_info(${table.name})`);
      console.table(columns);
      
      // Show first 5 rows of each table
      try {
        const [rows] = await sequelize.query(`SELECT * FROM ${table.name} LIMIT 5`);
        console.log(`\nFirst 5 rows of ${table.name}:`);
        console.table(rows);
      } catch (err) {
        console.error(`Error querying table ${table.name}:`, err.message);
      }
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error checking database tables:', error);
  }
}

checkTables();
