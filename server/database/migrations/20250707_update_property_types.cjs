import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Vérifier si les types existent déjà pour éviter les doublons
  const existingTypes = await knex('property_types').select('value');
  const existingValues = existingTypes.map(t => t.value);

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

  // Filtrer les types qui n'existent pas encore
  const typesToInsert = newTypes.filter(type => !existingValues.includes(type.value));

  if (typesToInsert.length > 0) {
    await knex('property_types').insert(typesToInsert);
    console.log(`Ajout de ${typesToInsert.length} nouveaux types de biens.`);
  } else {
    console.log('Tous les types de biens sont déjà présents dans la base de données.');
  }

  // Mettre à jour les labels des types existants si nécessaire
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

  for (const update of updates) {
    await knex('property_types')
      .where('value', update.value)
      .update({ label: update.label });
  }
}

export async function down(knex: Knex): Promise<void> {
  // Supprimer uniquement les nouveaux types ajoutés
  await knex('property_types')
    .whereIn('value', [
      'MAISON_ETAGE',
      'MAISON_SANS_ETAGE',
      'IMMEUBLE',
      'STUDIO',
      'VILLA',
      'TERRAIN',
      'COMMERCE_LOCAL',
      'HOTEL',
      'ENTREPOT',
      'FERME',
      'MAISON_PREFABRIQUEE',
      'APPARTEMENT_COLLECTIF',
      'LOGGEMENT_SOCIAL',
      'COMMERCE_DETAIL',
      'BATIMENT_INDUSTRIEL'
    ])
    .del();

  // Rétablir les labels d'origine
  const originalLabels = [
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

  for (const item of originalLabels) {
    await knex('property_types')
      .where('value', item.value)
      .update({ label: item.label });
  }
}
