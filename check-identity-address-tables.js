import knex from 'knex';
import knexConfig from './knexfile.js';

// Use the development configuration from knexfile
const db = knex(knexConfig.development);

async function checkIdentityAndAddressTables() {
  try {
    console.log('Checking identities and addresses tables...');

    // --- Check Identities Table ---
    console.log('\n\n--- Identities Table ---');
    const hasIdentitiesTable = await db.schema.hasTable('identities');
    if (hasIdentitiesTable) {
        console.log("'identities' table found!");

        // Structure of the "identities" table
        console.log('\nStructure of the "identities" table:');
        const identityColumns = await db.raw('PRAGMA table_info(identities);');
        console.log('Name | Type | NotNull | Default | PK');
        console.log('------|------|---------|---------|----');
        identityColumns.forEach(column => {
          console.log(
            `${column.name} | ${column.type} | ${column.notnull} | ${column.dflt_value || 'NULL'} | ${column.pk}`
          );
        });

        // Data in the "identities" table
        console.log('\nData in the "identities" table:');
        const identities = await db('identities').select('*').limit(5);
        console.log(JSON.stringify(identities, null, 2));
    } else {
        console.log("'identities' table NOT found!");
    }


    // --- Check Addresses Table ---
    console.log('\n\n--- Addresses Table ---');
    const hasAddressesTable = await db.schema.hasTable('addresses');
    if (hasAddressesTable) {
        console.log("'addresses' table found!");

        // Structure of the "addresses" table
        console.log('\nStructure of the "addresses" table:');
        const addressColumns = await db.raw('PRAGMA table_info(addresses);');
        console.log('Name | Type | NotNull | Default | PK');
        console.log('------|------|---------|---------|----');
        addressColumns.forEach(column => {
          console.log(
            `${column.name} | ${column.type} | ${column.notnull} | ${column.dflt_value || 'NULL'} | ${column.pk}`
          );
        });

        // Data in the "addresses" table
        console.log('\nData in the "addresses" table:');
        const addresses = await db('addresses').select('*').limit(5);
        console.log(JSON.stringify(addresses, null, 2));
    } else {
        console.log("'addresses' table NOT found!");
    }


  } catch (error) {
    console.error('Error while checking tables:', error);
  } finally {
    // Close the database connection
    await db.destroy();
  }
}

checkIdentityAndAddressTables();
