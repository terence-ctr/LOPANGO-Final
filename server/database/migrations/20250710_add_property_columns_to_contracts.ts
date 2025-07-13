import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Ajouter les colonnes à la table contracts
  await knex.schema.alterTable('contracts', (table) => {
    table.string('property_name').nullable();
    table.text('property_address').nullable();
    table.string('property_status').defaultTo('active');
  });

  // Mettre à jour les contrats existants avec les informations de propriété
  const contracts = await knex('contracts')
    .select('contracts.id', 'properties.title', 'properties.status', 
            'properties.street', 'properties.city', 'properties.postal_code', 'properties.country')
    .leftJoin('properties', 'contracts.property_id', 'properties.id');

  for (const contract of contracts) {
    const address = [
      contract.street,
      contract.city,
      contract.postal_code,
      contract.country
    ].filter(Boolean).join(', ');

    await knex('contracts')
      .where('id', contract.id)
      .update({
        property_name: contract.title || 'Propriété sans nom',
        property_address: address || null,
        property_status: contract.status || 'active'
      });
  }
}

export async function down(knex: Knex): Promise<void> {
  // Supprimer les colonnes ajoutées
  await knex.schema.alterTable('contracts', (table) => {
    table.dropColumn('property_name');
    table.dropColumn('property_address');
    table.dropColumn('property_status');
  });
}
