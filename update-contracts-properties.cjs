require('dotenv').config();
const knex = require('knex');
const knexConfig = require('./knexfile.cjs');
const path = require('path');

async function updateContractsWithProperties() {
  console.log('Démarrage de la mise à jour des contrats avec les informations de propriété...');
  let db;
  
  try {
    // 1. Configuration de la connexion à la base de données
    const config = {
      ...knexConfig.development,
      connection: {
        ...knexConfig.development.connection,
        filename: path.resolve(process.env.DATABASE_URL || knexConfig.development.connection.filename)
      }
    };
    
    db = knex(config);
    
    // 2. Vérification des colonnes
    const hasColumns = await db.schema.hasColumn('contracts', 'property_name');
    if (!hasColumns) {
      throw new Error('Les colonnes de propriété ne sont pas présentes dans la table contracts');
    }

    // 3. Récupération des contrats avec leurs propriétés
    console.log('Récupération des contrats et de leurs propriétés...');
    const contracts = await db('contracts')
      .select(
        'contracts.id as contract_id',
        'contracts.property_id',
        'properties.title',
        'properties.status',
        'properties.address',
        'properties.city',
        'properties.postal_code',
        'properties.country'
      )
      .leftJoin('properties', 'contracts.property_id', 'properties.id')
      .whereNull('contracts.property_name') // Seulement les contrats non mis à jour
      .orWhere('contracts.property_name', '=', '');

    if (contracts.length === 0) {
      console.log('Aucun contrat à mettre à jour.');
      return;
    }

    console.log(`Mise à jour de ${contracts.length} contrats...`);

    // 4. Mise à jour des contrats
    let updatedCount = 0;
    for (const contract of contracts) {
      if (!contract.property_id) {
        console.log(`Contrat ${contract.contract_id} n'a pas de propriété associée.`);
        continue;
      }

      // Utiliser l'adresse complète si elle existe, sinon construire à partir des champs disponibles
      let address = contract.address;
      if (!address) {
        address = [
          contract.city,
          contract.postal_code,
          contract.country
        ].filter(Boolean).join(', ');
      }

      try {
        await db('contracts')
          .where('id', contract.contract_id)
          .update({
            property_name: contract.title || 'Propriété sans nom',
            property_address: address,
            property_status: contract.status || 'active'
          });
        
        updatedCount++;
        
        // Afficher une mise à jour toutes les 10 enregistrements
        if (updatedCount % 10 === 0) {
          console.log(`Mise à jour en cours... ${updatedCount}/${contracts.length} contrats traités.`);
        }
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du contrat ${contract.contract_id}:`, error.message);
      }
    }

    console.log(`\nMise à jour terminée !`);
    console.log(`- Contrats traités: ${updatedCount}/${contracts.length}`);
    console.log(`- Échecs: ${contracts.length - updatedCount}`);

  } catch (error) {
    console.error('Erreur lors de la mise à jour des contrats:', error);
    process.exit(1);
  } finally {
    if (db) {
      await db.destroy();
    }
  }
}

// Exécution du script
updateContractsWithProperties();
