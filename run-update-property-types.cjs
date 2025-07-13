require('dotenv').config();
const knex = require('knex');
const knexConfig = require('./knexfile.cjs');
const path = require('path');

async function runPropertyTypesMigration() {
  console.log('Démarrage de la migration des types de biens...');
  let db;
  
  try {
    // Créer une instance Knex avec la configuration de développement
    const config = {
      ...knexConfig.development,
      connection: {
        ...knexConfig.development.connection,
        filename: path.resolve(process.env.DATABASE_URL || knexConfig.development.connection.filename)
      }
    };
    
    db = knex(config);
    
    // Vérifier la connexion à la base de données
    await db.raw('PRAGMA foreign_keys = ON');
    console.log('Connexion à la base de données établie avec succès');
    
    // Vérifier les types de biens actuels
    const currentTypes = await db('property_types').select('*');
    console.log(`\nTypes de biens actuels (${currentTypes.length}):`);
    currentTypes.forEach(t => console.log(`- ${t.label} (${t.value})`));
    
    // Exécuter directement la logique de migration
    console.log('\nExécution de la migration...');
    
    // Nouveaux types à ajouter
    const newTypes = [
      { value: 'MAISON_ETAGE', label: 'Maison avec étage' },
      { value: 'MAISON_SANS_ETAGE', label: 'Maison sans étage' },
      { value: 'IMMEUBLE', label: 'Immeuble (bâtiment à plusieurs logements ou bureaux)' },
      { value: 'STUDIO', label: 'Studio' },
      { value: 'VILLA', label: 'Villa' },
      { value: 'TERRAIN', label: 'Terrain (parcelle)' },
      { value: 'COMMERCE_LOCAL', label: 'Commerce local' },
      { value: 'HOTEL', label: 'Hôtel' },
      { value: 'ENTREPOT', label: 'Entrepôt' },
      { value: 'FERME', label: 'Ferme / Concession agricole' },
      { value: 'MAISON_PREFABRIQUEE', label: 'Maison préfabriquée' },
      { value: 'APPARTEMENT_COLLECTIF', label: 'Appartement (logement collectif)' },
      { value: 'LOGGEMENT_SOCIAL', label: 'Logement social' },
      { value: 'COMMERCE_DETAIL', label: 'Commerce de détail' },
      { value: 'BATIMENT_INDUSTRIEL', label: 'Bâtiment industriel' }
    ];

    // Mises à jour des libellés existants
    const updates = [
      { value: 'T1', label: 'Studio' },
      { value: 'T2', label: 'T2 (2 pièces)' },
      { value: 'T3', label: 'T3 (3 pièces)' },
      { value: 'T4+', label: 'T4+ (4 pièces et plus)' },
      { value: 'MAISON', label: 'Maison individuelle' },
      { value: 'APPARTEMENT', label: 'Appartement' },
      { value: 'BUREAU', label: 'Bureau' },
      { value: 'COMMERCE', label: 'Local commercial' },
      { value: 'AUTRE', label: 'Autre type de bien' }
    ];

    // Filtrer les nouveaux types à ajouter
    const existingValues = currentTypes.map(t => t.value);
    const typesToInsert = newTypes.filter(type => !existingValues.includes(type.value));

    // Ajouter les nouveaux types
    if (typesToInsert.length > 0) {
      console.log(`\nAjout de ${typesToInsert.length} nouveaux types...`);
      await db('property_types').insert(typesToInsert);
    } else {
      console.log('\nAucun nouveau type à ajouter.');
    }

    // Mettre à jour les libellés existants
    console.log('\nMise à jour des libellés existants...');
    for (const update of updates) {
      await db('property_types')
        .where('value', update.value)
        .update({ label: update.label });
    }

    // Afficher les types mis à jour
    const updatedTypes = await db('property_types').select('*').orderBy('id');
    console.log('\nTypes de biens mis à jour avec succès !');
    console.log(`Total: ${updatedTypes.length} types`);
    
  } catch (error) {
    console.error('\nErreur lors de la migration :', error);
    process.exit(1);
  } finally {
    // Fermer la connexion à la base de données
    if (db) {
      await db.destroy();
      console.log('\nConnexion à la base de données fermée.');
    }
    process.exit(0);
  }
}

// Exécuter la migration
runPropertyTypesMigration();
