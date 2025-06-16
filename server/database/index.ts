import knex from 'knex';
import knexConfig from '../../knexfile';

// Sélectionner la configuration en fonction de l'environnement
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Créer une instance Knex avec la configuration
const db = knex(config);

export { db };
