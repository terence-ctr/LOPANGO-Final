import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Vérifier si la colonne existe déjà pour éviter les erreurs
  const hasColumn = await knex.schema.hasColumn('contracts', 'payment_day');
  
  if (!hasColumn) {
    await knex.schema.alterTable('contracts', (table) => {
      // Ajouter la colonne payment_day de type integer, nullable
      // Si payment_day est null, cela signifie que le paiement est dû le jour de début de contrat
      table.integer('payment_day').nullable().comment('Jour du mois pour le paiement du loyer');
    });
    
    console.log('Colonne payment_day ajoutée à la table contracts');
  } else {
    console.log('La colonne payment_day existe déjà dans la table contracts');
  }
}

export async function down(knex: Knex): Promise<void> {
  // En cas de rollback, supprimer la colonne payment_day
  await knex.schema.alterTable('contracts', (table) => {
    table.dropColumn('payment_day');
  });
  
  console.log('Colonne payment_day supprimée de la table contracts');
}
