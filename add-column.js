import knex from './server/database/db.js';

async function addColumn() {
  try {
    // Vérifier si la colonne existe déjà
    const hasColumn = await knex.schema.hasColumn('refresh_tokens', 'created_by_ip');
    
    if (!hasColumn) {
      // Ajouter la colonne created_by_ip
      await knex.schema.alterTable('refresh_tokens', table => {
        table.string('created_by_ip', 45).nullable().after('created_at');
      });
      console.log('✅ Colonne created_by_ip ajoutée avec succès à la table refresh_tokens');
    } else {
      console.log('ℹ️ La colonne created_by_ip existe déjà dans la table refresh_tokens');
    }
    
    // Afficher le schéma mis à jour
    const columns = await knex('refresh_tokens').columnInfo();
    console.log('\nSchéma de la table refresh_tokens :');
    console.log(columns);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne :', error);
  } finally {
    await knex.destroy();
  }
}

addColumn().catch(console.error);
