const { v4: uuidv4 } = require('uuid');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.seed = async function(knex) {
  // Vérifier si la table alerts existe
  const hasAlertsTable = await knex.schema.hasTable('alerts');
  if (!hasAlertsTable) {
    console.log("La table 'alerts' n'existe pas. Veuillez d'abord exécuter la migration.");
    return;
  }

  // Récupérer tous les contrats actifs ou brouillons
  const contracts = await knex('contracts')
    .whereIn('status', ['active', 'draft']);

  if (contracts.length === 0) {
    console.log('Aucun contrat trouvé pour générer des alertes.');
    return;
  }

  // Préparer les alertes à insérer
  const alerts = [];
  const now = new Date();
  
  for (const contract of contracts) {
    // Utiliser le jour de paiement du contrat ou le 1er du mois par défaut
    const paymentDay = contract.payment_day || 1;
    
    // Créer une date de paiement pour le mois prochain
    const paymentDate = new Date(now);
    paymentDate.setDate(paymentDay);
    paymentDate.setMonth(paymentDate.getMonth() + 1);
    
    // Créer une alerte pour le paiement à venir
    const dueDate = paymentDate.toISOString().split('T')[0];
    const metadata = {
      payment_day: paymentDay,
      rent_amount: contract.rent,
      currency: contract.currency,
      due_date: dueDate
    };
    
    alerts.push({
      id: uuidv4(),
      title: `Paiement de loyer - Contrat #${contract.id}`.substring(0, 100), // Limiter la longueur
      message: `Le loyer de ${contract.rent} ${contract.currency} pour le contrat #${contract.id} est dû le ${dueDate}`.substring(0, 255), // Limiter la longueur
      type: 'PAYMENT',
      status: 'NEW',
      property_id: contract.property_id || null, // S'assurer que ce n'est pas undefined
      contract_id: contract.id,
      user_id: contract.landlord_id,
      // Pour SQLite, on stocke les métadonnées sous forme de chaîne JSON simple
      metadata: JSON.stringify(metadata)
    });
  }

  // Vérifier s'il y a des alertes à insérer
  if (alerts.length === 0) {
    console.log('Aucune alerte à insérer.');
    return;
  }

  try {
    // Vider la table des alertes existantes
    await knex('alerts').del();
    
    // Insérer les nouvelles alertes une par une pour éviter les problèmes de formatage
    for (const alert of alerts) {
      try {
        // Utiliser l'insertion standard de Knex avec des types explicites
        await knex('alerts').insert({
          id: alert.id,
          title: alert.title,
          message: alert.message,
          type: alert.type,
          status: alert.status,
          property_id: alert.property_id,
          contract_id: alert.contract_id,
          user_id: alert.user_id,
          // Pour SQLite, on utilise une chaîne JSON simple
          metadata: alert.metadata,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        });
      } catch (insertError) {
        console.error(`Erreur lors de l'insertion de l'alerte ${alert.id}:`, insertError);
      }
    }
    console.log(`✅ ${alerts.length} alertes de paiement ont été générées.`);
  } catch (error) {
    console.error('Erreur lors de la génération des alertes:', error);
  }
}
