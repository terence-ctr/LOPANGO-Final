/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('users', table => {
    // Ajout des colonnes pour la politique de confidentialité
    table.boolean('accepted_privacy_policy').defaultTo(false).notNullable();
    table.datetime('accepted_privacy_policy_at').nullable();
    
    // Ajout des colonnes pour les conditions d'utilisation
    table.boolean('accepted_terms').defaultTo(false).notNullable();
    table.datetime('accepted_terms_at').nullable();
    
    // Ajout des colonnes pour la vérification d'email
    table.datetime('email_verification_expire').nullable();
    table.string('email_verification_token', 255).nullable();
    
    // Ajout de la colonne pour l'authentification à deux facteurs
    table.boolean('mfa_enabled').defaultTo(false).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('users', table => {
    // Suppression des colonnes ajoutées
    table.dropColumn('accepted_privacy_policy');
    table.dropColumn('accepted_privacy_policy_at');
    table.dropColumn('accepted_terms');
    table.dropColumn('accepted_terms_at');
    table.dropColumn('email_verification_expire');
    table.dropColumn('email_verification_token');
    table.dropColumn('mfa_enabled');
  });
};
