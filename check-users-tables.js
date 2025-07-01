import knex from 'knex';
import knexConfig from './knexfile.js';

// Use the development configuration from knexfile
const db = knex(knexConfig.development);

async function checkTables() {
  try {
    // For SQLite, get tables from sqlite_master
    console.log('Checking tables...');
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table';");
    console.log('\nTables in the database:');
    tables.forEach(table => {
      console.log(`- ${table.name}`);
    });

    // Check for 'addresses' table specifically
    const hasAddressesTable = tables.some(table => table.name === 'addresses');
    if (hasAddressesTable) {
        console.log("\n'addresses' table found!");
    } else {
        console.log("\n'addresses' table NOT found! This is likely the problem.");
    }


    // For SQLite, use PRAGMA table_info to describe a table
    console.log('\n\nStructure of the "users" table:');
    const columns = await db.raw('PRAGMA table_info(users);');
    console.log('Name | Type | NotNull | Default | PK');
    console.log('------|------|---------|---------|----');
    columns.forEach(column => {
      console.log(
        `${column.name} | ${column.type} | ${column.notnull} | ${column.dflt_value} | ${column.pk}`
      );
    });

    // Check data in the users table
    console.log('\n\nData in the "users" table:');
    const users = await db('users').select('*').limit(5); // Limit to 5 for brevity
    console.log(JSON.stringify(users, null, 2));

  } catch (error) {
    console.error('Error while checking tables:', error);
  } finally {
    // Close the database connection
    await db.destroy();
  }
}

checkTables();
