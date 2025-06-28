const { Knex } = require('knex');

exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('property_types', (table) => {
    table.increments('id').primary();
    table.string('value').notNullable().unique();
    table.string('label').notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('property_statuses', (table) => {
    table.increments('id').primary();
    table.string('value').notNullable().unique();
    table.string('label').notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('property_equipments', (table) => {
    table.increments('id').primary();
    table.string('value').notNullable().unique();
    table.string('label').notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('currencies', (table) => {
    table.increments('id').primary();
    table.string('code', 3).notNullable().unique();
    table.string('label').notNullable();
    table.string('symbol').notNullable();
    table.timestamps(true, true);
  });

  // Insérer les données par défaut
  await knex('property_types').insert([
    { value: 'APPARTEMENT', label: 'Appartement' },
    { value: 'MAISON', label: 'Maison' },
    { value: 'COMMERCE', label: 'Commerce' },
    { value: 'T1', label: 'Studio' },
    { value: 'T2', label: '2 pièces' },
    { value: 'T3', label: '3 pièces' }
  ]);

  await knex('property_statuses').insert([
    { value: 'BROUILLON', label: 'Brouillon' },
    { value: 'DISPONIBLE', label: 'Disponible' },
    { value: 'LOUE', label: 'Loué' },
    { value: 'MAINTENANCE', label: 'Maintenance' }
  ]);

  await knex('property_equipments').insert([
    { value: 'FRIGO', label: 'FRIGO' },
    { value: 'CLIMATISATION', label: 'CLIMATISATION' },
    { value: 'CHAUFFAGE', label: 'CHAUFFAGE' },
    { value: 'PISCINE', label: 'PISCINE' },
    { value: 'JARDIN', label: 'JARDIN' },
    { value: 'TERRASSE', label: 'TERRASSE' },
    { value: 'BALCON', label: 'BALCON' },
    { value: 'PARKING', label: 'PARKING' },
    { value: 'ASCENSEUR', label: 'ASCENSEUR' },
    { value: 'GARAGE', label: 'GARAGE' },
    { value: 'INTERNET', label: 'INTERNET' },
    { value: 'TV', label: 'TV' },
    { value: 'LAVE_LINGE', label: 'LAVE_LINGE' },
    { value: 'SECHE_LINGE', label: 'SECHE_LINGE' },
    { value: 'LAVE_VAISSELLE', label: 'LAVE_VAISSELLE' },
    { value: 'FOUR', label: 'FOUR' },
    { value: 'MICRO_ONDES', label: 'MICRO_ONDES' },
    { value: 'ALARME', label: 'ALARME' },
    { value: 'INTERPHONE', label: 'INTERPHONE' },
    { value: 'GARDIEN', label: 'GARDIEN' }
  ]);

  await knex('currencies').insert([
    { code: 'EUR', label: '€ Euro', symbol: '€' },
    { code: 'USD', label: '$ US Dollar', symbol: '$' },
    { code: 'GBP', label: '£ Livre Sterling', symbol: '£' },
    { code: 'CHF', label: 'CHF Franc suisse', symbol: 'CHF' }
  ]);
}

exports.down = async function(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('currencies');
  await knex.schema.dropTableIfExists('property_equipments');
  await knex.schema.dropTableIfExists('property_statuses');
  await knex.schema.dropTableIfExists('property_types');
}
