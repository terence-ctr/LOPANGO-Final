/**
 * Seed pour créer des agents de test et des étages
 */

// Rôle agent
const AGENT_ROLE = 'agent';

/** @type {import('knex').Knex} */
const config = {};

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.seed = async function(knex) {
  // Vérifier si des agents existent déjà
  const existingAgents = await knex('users')
    .where('role', AGENT_ROLE)
    .select('id');

  if (existingAgents.length === 0) {
    // Insérer des agents de test
    await knex('users').insert([
      {
        first_name: 'Agent',
        last_name: 'Dupont',
        email: 'agent.dupont@example.com',
        phone: '+33612345678',
        role: AGENT_ROLE,
        is_active: true,
        email_verified_at: new Date(),
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'Agent',
        last_name: 'Martin',
        email: 'agent.martin@example.com',
        phone: '+33687654321',
        role: AGENT_ROLE,
        is_active: true,
        email_verified_at: new Date(),
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  }

  // Les étages sont déjà insérés par la migration
  // On peut ajouter ici d'autres données de test si nécessaire
};

exports.config = config;
