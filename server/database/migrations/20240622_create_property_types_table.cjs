/** @type {import('knex').Knex} */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function(knex) {
  // Créer la table property_types
  await knex.schema.createTable('property_types', (table) => {
    table.increments('id').primary();
    table.string('value').notNullable().unique();
    table.string('label').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('display_order').defaultTo(0);
    table.timestamps(true, true);
  });

  // Insérer les valeurs par défaut
  const propertyTypes = [
    { value: 'T1', label: 'T1' },
    { value: 'T2', label: 'T2' },
    { value: 'T3', label: 'T3' },
    { value: 'T4+', label: 'T4 et plus' },
    { value: 'MAISON', label: 'Maison' },
    { value: 'APPARTEMENT', label: 'Appartement' },
    { value: 'BUREAU', label: 'Bureau' },
    { value: 'COMMERCE', label: 'Local commercial' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  for (const [index, type] of propertyTypes.entries()) {
    await knex('property_types').insert({
      ...type,
      display_order: index + 1,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // Créer la table property_equipments
  await knex.schema.createTable('property_equipments', (table) => {
    table.increments('id').primary();
    table.string('value').notNullable().unique();
    table.string('label').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('display_order').defaultTo(0);
    table.timestamps(true, true);
  });

  // Insérer les équipements par défaut
  const equipments = [
    { value: 'FRIGO', label: 'Réfrigérateur' },
    { value: 'LINGE', label: 'Lave-linge' },
    { value: 'LAVE_VAISSELLE', label: 'Lave-vaisselle' },
    { value: 'MICRO_ONDES', label: 'Four à micro-ondes' },
    { value: 'FOUR', label: 'Four' },
    { value: 'PLAQUE_CUISSON', label: 'Plaque de cuisson' },
    { value: 'CAVE', label: 'Cave' },
    { value: 'GARAGE', label: 'Garage' },
    { value: 'PARKING', label: 'Place de parking' },
    { value: 'INTERNET', label: 'Internet' },
    { value: 'CLIMATISATION', label: 'Climatisation' },
    { value: 'CHAUFFAGE', label: 'Chauffage' },
    { value: 'MEUBLE', label: 'Meublé' },
    { value: 'ASCENSEUR', label: 'Ascenseur' },
    { value: 'DIGICODE', label: 'Digicode' },
    { value: 'INTERPHONE', label: 'Interphone' },
    { value: 'GARDIEN', label: 'Gardien' },
    { value: 'ALARME', label: 'Alarme' }
  ];

  for (const [index, equipment] of equipments.entries()) {
    await knex('property_equipments').insert({
      ...equipment,
      display_order: index + 1,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function(knex) {
  await knex.schema.dropTableIfExists('property_equipments');
  await knex.schema.dropTableIfExists('property_types');
};

exports.up = up;
exports.down = down;
