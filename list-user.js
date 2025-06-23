import knex from 'knex';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './server/database/lopango_dev.sqlite3'
  },
  useNullAsDefault: true
});

async function listproperties() {
  try {
    const properties = await db('properties').select('id', 'owner_id', 'title', 'description', 'type', 'status', 'city', 'country', 'latitude', 'longitude', 'area', 'rooms', 'bathrooms', 'floor', 'furnished', 'equipment', 'has_elevator', 'has_parking', 'has_balcony', 'has_terrace', 'has_garden', 'has_pool', 'has_air_conditioning', 'has_heating', 'year_built', 'rent', 'charges', 'deposit', 'currency', 'is_featured', 'available_from', 'custom_fields', 'published_at', 'created_at', 'updated_at', 'address', );
    console.log('Properties existants :');
    console.table(properties);
  } catch (error) {
    console.error('Erreur lors de la récupération des properties :', error);
  } finally {
    await db.destroy();
  }
}

listproperties();
