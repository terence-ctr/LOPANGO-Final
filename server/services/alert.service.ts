import { db } from '../database/db';

export const AlertType = {
  // Contrats
  CONTRACT_CREATED: 'CONTRACT_CREATED',
  CONTRACT_SIGNED: 'CONTRACT_SIGNED',
  CONTRACT_ENDED: 'CONTRACT_ENDED',
  CONTRACT_RENEWAL: 'CONTRACT_RENEWAL',
  
  // Paiements
  DEPOSIT_REQUESTED: 'DEPOSIT_REQUESTED',
  DEPOSIT_PAID: 'DEPOSIT_PAID',
  DEPOSIT_REFUNDED: 'DEPOSIT_REFUNDED',
  RENT_PAYMENT_DUE: 'RENT_PAYMENT_DUE',
  RENT_PAYMENT_OVERDUE: 'RENT_PAYMENT_OVERDUE',
  RENT_PAYMENT_RECEIVED: 'RENT_PAYMENT_RECEIVED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  
  // Documents
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_APPROVED: 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED: 'DOCUMENT_REJECTED',
  
  // Maintenance
  MAINTENANCE_REQUESTED: 'MAINTENANCE_REQUESTED',
  MAINTENANCE_SCHEDULED: 'MAINTENANCE_SCHEDULED',
  MAINTENANCE_COMPLETED: 'MAINTENANCE_COMPLETED',
  
  // Visites
  VISIT_SCHEDULED: 'VISIT_SCHEDULED',
  VISIT_REMINDER: 'VISIT_REMINDER',
  VISIT_CANCELLED: 'VISIT_CANCELLED',
  
  // Autres
  SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED'
} as const;

export type AlertType = typeof AlertType[keyof typeof AlertType];

export interface AlertMetadata {
  actionUrl?: string;
  contractId?: number;
  propertyId?: number;
  tenantId?: number;
  landlordId?: number;
  amount?: number;
  currency?: string;
  dueDate?: string;
  daysUntilDue?: number;
  paymentDate?: string | Date;
  receiptUrl?: string | null;
  [key: string]: any;
}

export interface Alert {
  id?: number;
  userId: number;
  type: AlertType;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedEntityType?: 'contract' | 'payment' | 'property' | 'user';
  relatedEntityId?: number;
  metadata?: AlertMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

export const createAlert = async (alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> => {
  const [newAlert] = await db('alerts')
    .insert({
      user_id: alert.userId,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      is_read: alert.isRead,
      priority: alert.priority,
      related_entity_type: alert.relatedEntityType,
      related_entity_id: alert.relatedEntityId,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning('*');
  
  return {
    ...newAlert,
    id: newAlert.id,
    userId: newAlert.user_id,
    isRead: newAlert.is_read,
    relatedEntityType: newAlert.related_entity_type,
    relatedEntityId: newAlert.related_entity_id,
    createdAt: newAlert.created_at,
    updatedAt: newAlert.updated_at
  };
};

export const sendContractCreatedAlerts = async (contractId: number, landlordId: number, tenantId: number, trx?: any) => {
  const useTransaction = !trx;
  
  try {
    if (useTransaction) {
      trx = await db.transaction();
    }
    
    // First get the contract with property details
    const contract = await trx('contracts')
      .select('contracts.*', 'properties.title as property_title', 'properties.address as property_address')
      .leftJoin('properties', 'contracts.property_id', 'properties.id')
      .where('contracts.id', contractId)
      .first();

    if (!contract) throw new Error('Contrat non trouvé');
    if (!contract.property_id) throw new Error('ID de propriété manquant dans le contrat');

    // Then get the property details
    const property = await trx('properties')
      .select('title', 'address')
      .where('id', contract.property_id)
      .first();

    if (!property) throw new Error('Propriété non trouvée');

    // Get user details
    const [landlord, tenant] = await Promise.all([
      trx('users').select('*').where('id', landlordId).first(),
      trx('users').select('*').where('id', tenantId).first()
    ]);

    if (!landlord || !tenant) {
      throw new Error('Bailleur ou locataire non trouvé');
    }

    // Format de l'adresse
    const propertyAddress = typeof property.address === 'string' 
      ? property.address 
      : `${property.address?.street || ''}, ${property.address?.postalCode || ''} ${property.address?.city || ''}`;

    // Alerte pour le bailleur
    await createAlert({
      userId: landlordId,
      type: AlertType.CONTRACT_CREATED,
      title: 'Nouveau contrat créé',
      message: `Un nouveau contrat a été créé avec ${tenant.first_name} ${tenant.last_name} ` +
               `pour la propriété ${property.title} (${propertyAddress}). ` +
               'Vous pouvez consulter et gérer ce contrat depuis votre espace personnel.',
      isRead: false,
      priority: 'high',
      relatedEntityType: 'contract',
      relatedEntityId: contractId,
      metadata: {
        actionUrl: `/contracts/${contractId}`,
        contractId,
        propertyId: contract.property_id,
        tenantId: contract.tenant_id
      }
    });

    // Alerte pour le locataire
    await createAlert({
      userId: tenantId,
      type: AlertType.CONTRACT_CREATED,
      title: 'Nouveau contrat créé',
      message: `Un nouveau contrat a été créé avec ${landlord.first_name} ${landlord.last_name} ` +
               `pour la propriété ${property.title} (${propertyAddress}). ` +
               'Veuillez consulter et signer le contrat dès que possible pour finaliser la location.',
      isRead: false,
      priority: 'high',
      relatedEntityType: 'contract',
      relatedEntityId: contractId,
      metadata: {
        actionUrl: `/contracts/${contractId}`,
        contractId,
        propertyId: contract.property_id,
        landlordId: contract.landlord_id
      }
    });

    if (useTransaction) {
      await trx.commit();
    }
  } catch (error) {
    if (useTransaction && trx) {
      await trx.rollback();
    }
    console.error('Erreur lors de l\'envoi des alertes de création de contrat:', error);
    throw error;
  }
};

export const sendDepositReminder = async (contractId: number, tenantId: number, trx?: any) => {
  const useTransaction = !trx;
  
  try {
    if (useTransaction) {
      trx = await db.transaction();
    }
    
    // Use the provided transaction for all queries
    const contract = await trx('contracts')
      .select('contracts.*', 'properties.title as property_title')
      .leftJoin('properties', 'contracts.property_id', 'properties.id')
      .where('contracts.id', contractId)
      .first();
    
    if (!contract) {
      console.error(`Contrat avec l'ID ${contractId} non trouvé`);
      return;
    }

    const tenant = await trx('users').where('id', tenantId).first();
    if (!tenant) {
      console.error(`Locataire avec l'ID ${tenantId} non trouvé`);
      return;
    }

    // Vérifier si le dépôt a déjà été payé
    const depositPayment = await trx('payments')
      .where({
        contract_id: contractId,
        type: 'deposit',
        status: 'completed'
      })
      .first();

    if (depositPayment) {
      console.log('La caution a déjà été payée pour ce contrat');
      return;
    }

    // Créer une alerte pour le locataire
    await createAlert({
      userId: tenantId,
      type: AlertType.DEPOSIT_REQUESTED,
      title: 'Paiement de la caution requis',
      message: `Veuillez effectuer le paiement de la caution de ${contract.deposit} ${contract.currency} ` +
               `pour le contrat concernant le bien "${contract.property_title}". ` +
               'Ce paiement est nécessaire pour valider votre dossier de location.',
      isRead: false,
      priority: 'high',
      relatedEntityType: 'contract',
      relatedEntityId: contractId,
      metadata: {
        actionUrl: `/payments/new?contractId=${contractId}&amount=${contract.deposit}&type=deposit`,
        contractId,
        amount: contract.deposit,
        currency: contract.currency,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // Délai de 3 jours
      }
    });

    // Envoyer également une notification au bailleur
    await createAlert({
      userId: contract.landlord_id,
      type: AlertType.DEPOSIT_REQUESTED,
      title: 'En attente du paiement de la caution',
      message: `Une demande de paiement de la caution de ${contract.deposit} ${contract.currency} ` +
               `a été envoyée à ${tenant.first_name} ${tenant.last_name} pour le contrat concernant "${contract.property_title}".`,
      isRead: false,
      priority: 'medium',
      relatedEntityType: 'contract',
      relatedEntityId: contractId,
      metadata: {
        actionUrl: `/contracts/${contractId}`,
        contractId,
        tenantId: tenant.id
      }
    });

    if (useTransaction) {
      await trx.commit();
    }
  } catch (error) {
    if (useTransaction && trx) {
      await trx.rollback();
    }
    console.error('Erreur lors de l\'envoi du rappel de caution:', error);
    throw error;
  }
};

export const sendPaymentReminder = async (contractId: number, tenantId: number, daysUntilDue: number) => {
  const trx = await db.transaction();
  
  try {
    // Récupérer les informations du contrat avec les détails du bien et des utilisateurs
    const contract = await trx('contracts')
      .select(
        'contracts.*',
        'properties.title as property_title',
        'landlord.id as landlord_id',
        'landlord.first_name as landlord_first_name',
        'landlord.last_name as landlord_last_name',
        'tenant.first_name as tenant_first_name',
        'tenant.last_name as tenant_last_name',
        'tenant.email as tenant_email'
      )
      .leftJoin('properties', 'contracts.property_id', 'properties.id')
      .leftJoin('users as landlord', 'contracts.landlord_id', 'landlord.id')
      .leftJoin('users as tenant', 'contracts.tenant_id', 'tenant.id')
      .where('contracts.id', contractId)
      .first();
    
    if (!contract) {
      console.error(`Contrat avec l'ID ${contractId} non trouvé`);
      return;
    }

    // Vérifier si le paiement a déjà été effectué pour le mois en cours
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const existingPayment = await trx('payments')
      .where({
        contract_id: contractId,
        type: 'rent',
        status: 'completed',
        month: currentMonth,
        year: currentYear
      })
      .first();

    if (existingPayment) {
      console.log(`Le loyer pour ${currentMonth}/${currentYear} a déjà été payé`);
      return;
    }

    // Déterminer le type d'alerte et le message en fonction du nombre de jours avant/après l'échéance
    let alertType: AlertType;
    let title: string;
    let message: string;
    let priority: 'low' | 'medium' | 'high' = 'medium';
    let notifyLandlord = false;

    if (daysUntilDue > 0) {
      // Rappel avant l'échéance
      alertType = AlertType.RENT_PAYMENT_DUE;
      title = `Paiement du loyer dans ${daysUntilDue} jour(s)`;
      message = `Rappel : Votre loyer de ${contract.rent} ${contract.currency} ` +
                `pour le bien "${contract.property_title}" est dû dans ${daysUntilDue} jour(s).`;
      priority = daysUntilDue <= 3 ? 'high' : 'medium';
      notifyLandlord = daysUntilDue <= 3; // Notifier le bailleur seulement 3 jours avant
    } else if (daysUntilDue === 0) {
      // Jour J
      alertType = AlertType.RENT_PAYMENT_DUE;
      title = 'Paiement du loyer d\'aujourd\'hui';
      message = `Aujourd'hui est le jour de paiement de votre loyer de ${contract.rent} ${contract.currency} ` +
                `pour le bien "${contract.property_title}".`;
      priority = 'high';
      notifyLandlord = true;
    } else {
      // En retard
      const daysOverdue = Math.abs(daysUntilDue);
      alertType = AlertType.RENT_PAYMENT_OVERDUE;
      title = `Retard de paiement (${daysOverdue} jour(s))`;
      message = `Votre paiement de ${contract.rent} ${contract.currency} pour le bien "${contract.property_title}" ` +
                `est en retard de ${daysOverdue} jour(s). Veuillez régulariser au plus vite pour éviter les pénalités.`;
      priority = 'high';
      notifyLandlord = true;
    }

    // Créer l'alerte pour le locataire
    await createAlert({
      userId: tenantId,
      type: alertType,
      title,
      message,
      isRead: false,
      priority,
      relatedEntityType: 'contract',
      relatedEntityId: contractId,
      metadata: {
        actionUrl: `/payments/new?contractId=${contractId}&amount=${contract.rent}&type=rent`,
        contractId,
        amount: contract.rent,
        currency: contract.currency,
        dueDate: new Date(now.setDate(now.getDate() + daysUntilDue)).toISOString(),
        daysUntilDue
      }
    });

    // Créer une alerte pour le bailleur si nécessaire
    if (notifyLandlord && contract.landlord_id) {
      const landlordTitle = `Paiement du loyer ${daysUntilDue >= 0 ? 'à venir' : 'en retard'}`;
      const landlordAlertType: AlertType = daysUntilDue >= 0 ? AlertType.RENT_PAYMENT_DUE : AlertType.RENT_PAYMENT_OVERDUE;
      let landlordMessage = '';
      
      if (daysUntilDue > 0) {
        landlordMessage = `Le loyer de ${contract.rent} ${contract.currency} ` +
                        `est dû dans ${daysUntilDue} jour(s) pour le bien "${contract.property_title}" ` +
                        `(locataire: ${contract.tenant_first_name} ${contract.tenant_last_name}).`;
      } else if (daysUntilDue === 0) {
        landlordMessage = `Le loyer de ${contract.rent} ${contract.currency} est dû aujourd'hui ` +
                        `pour le bien "${contract.property_title}" ` +
                        `(locataire: ${contract.tenant_first_name} ${contract.tenant_last_name}).`;
      } else {
        const daysOverdue = Math.abs(daysUntilDue);
        landlordMessage = `Le paiement du loyer de ${contract.rent} ${contract.currency} est en retard de ${daysOverdue} jour(s) ` +
                        `pour le bien "${contract.property_title}" ` +
                        `(locataire: ${contract.tenant_first_name} ${contract.tenant_last_name}).`;
      }

      await createAlert({
        userId: contract.landlord_id,
        type: landlordAlertType,
        title: landlordTitle,
        message: landlordMessage,
        isRead: false,
        priority: daysUntilDue >= 0 ? 'medium' : 'high',
        relatedEntityType: 'contract',
        relatedEntityId: contractId,
        metadata: {
          actionUrl: `/contracts/${contractId}`,
          contractId,
          tenantId,
          amount: contract.rent,
          currency: contract.currency,
          daysUntilDue
        }
      });
    }

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    console.error('Erreur lors de l\'envoi du rappel de paiement:', error);
  }
};

export const sendPaymentReceivedAlert = async (contractId: number, paymentId: number, amount: number, currency: string) => {
  const trx = await db.transaction();
  
  try {
    // Récupérer les informations complètes du paiement, du contrat, du bien et des utilisateurs
    const [payment, contract] = await Promise.all([
      trx('payments')
        .where('id', paymentId)
        .first(),
      trx('contracts')
        .select(
          'contracts.*',
          'properties.title as property_title',
          'landlord.id as landlord_id',
          'landlord.first_name as landlord_first_name',
          'landlord.last_name as landlord_last_name',
          'tenant.id as tenant_id',
          'tenant.first_name as tenant_first_name',
          'tenant.last_name as tenant_last_name'
        )
        .leftJoin('properties', 'contracts.property_id', 'properties.id')
        .leftJoin('users as landlord', 'contracts.landlord_id', 'landlord.id')
        .leftJoin('users as tenant', 'contracts.tenant_id', 'tenant.id')
        .where('contracts.id', contractId)
        .first()
    ]);

    if (!payment) {
      throw new Error(`Paiement avec l'ID ${paymentId} non trouvé`);
    }

    if (!contract) {
      throw new Error(`Contrat avec l'ID ${contractId} non trouvé`);
    }

    const paymentTypeLabels: Record<string, string> = {
      'rent': 'loyer',
      'deposit': 'caution',
      'charge': 'charges',
      'other': 'autre paiement'
    };

    const paymentType = paymentTypeLabels[payment.type as keyof typeof paymentTypeLabels] || 'paiement';
    const paymentDate = new Date(payment.payment_date || payment.created_at).toLocaleDateString('fr-FR');

    // Alerte pour le bénéficiaire (bailleur pour un loyer, agence pour une caution, etc.)
    const recipientId = payment.recipient_id || contract.landlord_id;
    await createAlert({
      userId: recipientId,
      type: AlertType.RENT_PAYMENT_RECEIVED,
      title: `${payment.type === 'deposit' ? 'Caution' : 'Paiement'} reçu`,
      message: `Un ${paymentType} de ${amount} ${currency} a été reçu de la part de ` +
              `${contract.tenant_first_name} ${contract.tenant_last_name} ` +
              `pour le bien "${contract.property_title}" (${paymentDate}).`,
      isRead: false,
      priority: 'medium',
      relatedEntityType: 'payment',
      relatedEntityId: paymentId,
      metadata: {
        actionUrl: `/payments/${paymentId}`,
        contractId,
        propertyId: contract.property_id,
        tenantId: contract.tenant_id,
        amount: payment.amount,
        currency: payment.currency,
        paymentDate: payment.payment_date || payment.created_at
      }
    });

    // Alerte pour le payeur (locataire)
    await createAlert({
      userId: contract.tenant_id,
      type: AlertType.RENT_PAYMENT_RECEIVED,
      title: `${payment.type === 'deposit' ? 'Caution' : 'Paiement'} confirmé`,
      message: `Votre ${paymentType} de ${amount} ${currency} ` +
              `pour le bien "${contract.property_title}" a été enregistré avec succès le ${paymentDate}.`,
      isRead: false,
      priority: 'medium',
      relatedEntityType: 'payment',
      relatedEntityId: paymentId,
      metadata: {
        actionUrl: `/payments/${paymentId}`,
        contractId,
        propertyId: contract.property_id,
        amount: payment.amount,
        currency: payment.currency,
        paymentDate: payment.payment_date || payment.created_at,
        receiptUrl: payment.receipt_url || null
      }
    });

    // Si c'est un paiement de loyer, vérifier s'il y a des rappels en attente et les marquer comme résolus
    if (payment.type === 'rent') {
      await trx('alerts')
        .where({
          user_id: contract.tenant_id,
          type: AlertType.RENT_PAYMENT_DUE,
          related_entity_type: 'contract',
          related_entity_id: contractId,
          status: 'NEW'
        })
        .update({
          status: 'RESOLVED',
          updated_at: new Date()
        });
    }

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    console.error('Erreur lors de l\'envoi de la confirmation de paiement:', error);
    throw error;
  }
};
