
exports.up = async function(knex) {
  // Get all equipments
  const equipments = await knex('property_equipments').select('id', 'value');

  // Create a transaction to update all records
  return knex.transaction(async (trx) => {
    const promises = equipments.map(equipment => {
      const upperCaseValue = equipment.value.toUpperCase();
      return trx('property_equipments')
        .where('id', equipment.id)
        .update({
          value: upperCaseValue,
          label: upperCaseValue, // Set label to be the same as value
        });
    });
    await Promise.all(promises);
  });
};

exports.down = function(knex) {
  // This migration is not easily reversible, so the down function is empty.
  return Promise.resolve();
};
