import { Request, Response } from 'express';
import { db } from '../database';

// Définir les types locaux
interface PaymentStatus {
  status: string;
  days: number;
  alert: boolean;
}

// Fonction utilitaire pour déterminer le statut du paiement
const getPaymentStatus = (paymentDay: number | null, startDate?: string | null): { status: string; days: number; alert: boolean } => {
  // Si pas de jour de paiement défini ou si la date de début est manquante
  if (!paymentDay || !startDate) {
    return { status: 'non défini', days: 0, alert: false };
  }

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Vérifier si la date de début est dans le futur
  const startDateObj = new Date(startDate);
  if (startDateObj > now) {
    return { status: 'à venir', days: 0, alert: false };
  }

  // Créer la date de paiement pour ce mois
  const paymentDate = new Date(currentYear, currentMonth, Math.min(paymentDay, 28)); // Utiliser max 28 pour éviter les problèmes de mois
  
  // Si le jour de paiement est déjà passé ce mois-ci
  if (currentDay > paymentDay) {
    const daysLate = currentDay - paymentDay;
    return {
      status: daysLate > 0 ? 'en retard' : 'à échéance',
      days: daysLate,
      alert: daysLate > 0
    };
  }

  // Si le jour de paiement est aujourd'hui ou dans le futur
  return {
    status: currentDay === paymentDay ? 'à échéance' : 'à venir',
    days: 0,
    alert: false
  };
};

// Définir les types locaux pour éviter les conflits
type LocalContractRequest = Request & {
  user?: {
    id: number;
    email: string;
    userType: string;
    firstName?: string;
    lastName?: string;
    email_verified?: boolean;
  };
  query: {
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
};

interface LocalContractQueryResult {
  id: number;
  property_id: number;
  tenant_id: number;
  landlord_id: number;
  agent_id: number | null;
  start_date: string;
  end_date: string;
  status: string;
  payment_day: number | null;
  rent_amount: number;
  deposit_amount: number;
  deposit_status: string;
  created_at: string;
  updated_at: string;
  property_title: string | null;
  property_address_street: string | null;
  property_address_city: string | null;
  property_address_postal_code: string | null;
  property_address_country: string | null;
  landlord_first_name: string | null;
  landlord_last_name: string | null;
  landlord_email: string | null;
  agent_first_name: string | null;
  agent_last_name: string | null;
  agent_email: string | null;
  tenant_first_name: string | null;
  tenant_last_name: string | null;
  tenant_email: string | null;
}

interface FormattedContract {
  id: number;
  name: string;
  property: {
    id: number;
    name: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    landlord: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    agent?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  };
  tenant: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  agent?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus: string;
  paymentDays: number;
  paymentAlert: boolean;
  rentAmount: number;
  depositAmount: number;
  depositStatus: string;
  paymentDay: number | null;
  createdAt: string;
  updatedAt: string;
}

export const getTenantContracts = async (req: LocalContractRequest, res: Response): Promise<Response> => {
  console.log('=== DÉBUT getTenantContracts ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('User:', req.user);
  console.log('Query params:', req.query);
  
  // Vérifier si l'utilisateur est connecté avant de continuer
  if (!req.user) {
    console.error('Erreur: Aucun utilisateur connecté');
    return res.status(401).json({ 
      status: 'error',
      message: 'Non autorisé: Utilisateur non connecté' 
    });
  }

  const userId = req.user.id;
  const userType = req.user.userType;
  
  // Afficher les contrats liés à l'utilisateur connecté dans les logs
  try {
    let userContracts: Array<{
      id: number;
      property_id: number | null;
      tenant_id: number | null;
      landlord_id: number | null;
      start_date: string;
      end_date: string | null;
      status: string;
      payment_day: number | null;
      rent: number;
      currency: string;
      deposit: number;
      duration: string;
      special_conditions: string | null;
      created_at: string;
      updated_at: string;
    }> = [];
    
    if (userType === 'tenant') {
      console.log(`=== CONTRATS DU LOCATAIRE (ID: ${userId}) ===`);
      userContracts = await db('contracts')
        .where('tenant_id', userId);
    } else if (userType === 'landlord') {
      console.log(`=== CONTRATS DU PROPRIÉTAIRE (ID: ${userId}) ===`);
      userContracts = await db('contracts')
        .where('landlord_id', userId);
    } else if (userType === 'admin') {
      console.log('=== TOUS LES CONTRATS (ACCÈS ADMIN) ===');
      userContracts = await db('contracts').select('*');
    }
    
    console.log(JSON.stringify(userContracts, null, 2));
    console.log('======================================');
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error);
  }
  
  try {
    // Vérifier si l'utilisateur est connecté
    if (!req.user) {
      console.error('Non autorisé: Utilisateur non connecté');
      return res.status(401).json({ 
        status: 'error',
        message: 'Non autorisé: Utilisateur non connecté' 
      });
    }

    const userId = req.user.id;
    console.log(`Locataire connecté: ID=${userId}, Type=${req.user.userType}`);

    // Récupérer les paramètres de requête
    const { status, sortBy = 'start_date', sortOrder = 'desc' } = req.query;
    console.log('Paramètres de requête:', { status, sortBy, sortOrder });

    // Construire la requête de base
    console.log('Construction de la requête de base...');
    
    // Récupérer d'abord les contrats de base
    let contractsQuery = db('contracts as c')
      .select('*')
      .whereNot('status', 'deleted');
      
    // Filtrer en fonction du type d'utilisateur
    if (req.user.userType === 'tenant') {
      console.log(`Filtrage pour locataire (ID: ${userId})`);
      contractsQuery = contractsQuery.where('tenant_id', userId);
    } else if (req.user.userType === 'landlord') {
      console.log(`Filtrage pour propriétaire (ID: ${userId})`);
      contractsQuery = contractsQuery.where('landlord_id', userId);
    } else if (req.user.userType !== 'admin') {
      // Si l'utilisateur n'est ni admin, ni propriétaire, ni locataire, on ne retourne rien
      console.log('Utilisateur non autorisé à voir les contrats');
      return res.status(200).json({ status: 'success', data: [] });
    }

    // Filtrer par statut si spécifié
    if (status) {
      console.log(`Filtrage par statut: ${status}`);
      contractsQuery = contractsQuery.where('status', status);
    }

    // Trier les résultats
    console.log(`Tri par: ${sortBy} (${sortOrder})`);
    contractsQuery = contractsQuery.orderBy(sortBy, sortOrder as 'asc' | 'desc');

    // Exécuter la requête pour obtenir les contrats
    console.log('Exécution de la requête de récupération des contrats...');
    console.log('Requête SQL:', contractsQuery.toSQL().toNative());
    
    let contracts = [];
    try {
      contracts = await contractsQuery;
      console.log(`Nombre de contrats trouvés: ${contracts.length}`);
      console.log('Contrats bruts:', JSON.stringify(contracts, null, 2));
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la récupération des contrats',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
    
    // Si aucun contrat n'est trouvé, retourner un tableau vide
    if (!contracts || contracts.length === 0) {
      console.log('Aucun contrat trouvé pour cet utilisateur');
      return res.status(200).json({ 
        status: 'success', 
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('Récupération des informations supplémentaires pour chaque contrat...');
    const enrichedContracts = await Promise.all(contracts.map(async (contract: any) => {
      // Récupérer les informations du bien
      const property = await db('properties')
        .where('id', contract.property_id)
        .first()
        .select(
          'title',
          'quartier',
          'commune'
        );
      
      // Récupérer les informations du propriétaire
      const landlord = await db('users')
        .where('id', contract.landlord_id)
        .first()
        .select('first_name', 'last_name', 'email');
      
      // Récupérer les informations du locataire
      const tenant = await db('users')
        .where('id', contract.tenant_id)
        .first()
        .select('first_name', 'last_name', 'email');
      
      // Construire l'objet de réponse avec toutes les propriétés nécessaires
      const formattedContract = {
        // Champs de base
        id: contract.id,
        property_id: contract.property_id,
        tenant_id: contract.tenant_id,
        landlord_id: contract.landlord_id,
        start_date: contract.start_date,
        end_date: contract.end_date,
        status: contract.status,
        payment_day: contract.payment_day,
        rent: contract.rent,
        deposit: contract.deposit,
        deposit_status: contract.deposit_status || 'non payé',
        currency: contract.currency || 'EUR',
        duration: contract.duration || '1 an',
        special_conditions: contract.special_conditions || '',
        created_at: contract.created_at,
        updated_at: contract.updated_at,
        
        // Propriétés du bien
        // Utiliser les champs d'adresse existants
        property_title: property?.title || 'Propriété inconnue',
        property_address_street: property?.quartier || '',
        property_address_city: property?.commune || '',
        property_address_postal_code: '', // Champ non disponible dans la base actuelle
        property_address_country: 'congo', // Valeur par défaut
        
        // Informations du propriétaire
        landlord_first_name: landlord?.first_name || 'Propriétaire',
        landlord_last_name: landlord?.last_name || 'Inconnu',
        landlord_email: landlord?.email || '',
        
        // Informations du locataire
        tenant_first_name: tenant?.first_name || 'Locataire',
        tenant_last_name: tenant?.last_name || 'Inconnu',
        tenant_email: tenant?.email || ''
      };
      
      console.log('Contrat formaté:', JSON.stringify(formattedContract, null, 2));
      return formattedContract;
    }));
    
    console.log('Contrats enrichis avec succès');
    console.log('Contrats bruts:', JSON.stringify(enrichedContracts, null, 2));

    // Formater les données pour le frontend
    console.log('Formatage des données pour le frontend...');
    const formattedContracts = [];
    
    for (const contract of enrichedContracts) {
      try {
        // Créer l'objet de contrat formaté avec les champs attendus par le frontend
        const formattedContract = {
          id: contract.id,
          landlord_id: contract.landlord_id,
          tenant_id: contract.tenant_id,
          property_id: contract.property_id,
          start_date: contract.start_date || new Date().toISOString().split('T')[0],
          end_date: contract.end_date || '',
          rent: contract.rent || 0,
          deposit: contract.deposit || 0,
          currency: contract.currency || 'EUR',
          duration: contract.duration || '1 an',
          status: contract.status || 'draft',
          special_conditions: contract.special_conditions || '',
          payment_day: contract.payment_day || null,
          // Champs supplémentaires pour la rétrocompatibilité avec le frontend
          landlord_first_name: contract.landlord_first_name || 'Propriétaire',
          landlord_last_name: contract.landlord_last_name || 'Inconnu',
          landlord_email: contract.landlord_email || '',
          tenant_first_name: contract.tenant_first_name || 'Locataire',
          tenant_last_name: contract.tenant_last_name || 'Inconnu',
          tenant_email: contract.tenant_email || '',
          property_title: contract.property_title || 'Propriété inconnue',
          property_address_street: contract.property_address_street || '',
          property_address_city: contract.property_address_city || '',
          property_address_postal_code: contract.property_address_postal_code || '',
          property_address_country: contract.property_address_country || 'congo',
          deposit_status: contract.deposit_status || 'non payé',
          created_at: contract.created_at || new Date().toISOString(),
          updated_at: contract.updated_at || new Date().toISOString()
        };
        
        console.log('Contrat formaté pour le frontend:', JSON.stringify(formattedContract, null, 2));
        formattedContracts.push(formattedContract);
      } catch (error) {
        console.error('Erreur lors du formatage du contrat:', error);
      }
    }
    
    console.log('Contrats du locataire formatés avec succès');
    console.log('=== FIN getTenantContracts - SUCCÈS ===');
    return res.json({
      status: 'success',
      data: formattedContracts,
      count: formattedContracts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('=== ERREUR dans getTenantContracts ===');
    console.error('Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Message d\'erreur:', error instanceof Error ? error.message : 'Erreur inconnue');
    
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Code d\'erreur:', (error as any).code);
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la récupération des contrats',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Erreur inconnue') : 
        undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Crée un nouveau contrat
 */
export const createContract = async (req: LocalContractRequest, res: Response): Promise<Response> => {
  console.log('Début de la création d\'un nouveau contrat...');
  
  // Démarrer une transaction
  const trx = await db.transaction();
  
  try {
    console.log('--- Données reçues ---');
    console.log('Corps de la requête:', JSON.stringify(req.body, null, 2));
    
    // Extraction des champs avec des valeurs par défaut
    const {
      landlordId,
      tenantId,
      propertyId,
      startDate = new Date().toISOString().split('T')[0],
      endDate = null,
      rent = 0,
      deposit = 0,
      currency = 'EUR',
      duration = 12,
      specialConditions = '',
      status = 'draft',
      paymentDay = new Date().getDate()
    } = req.body;

    // Validation des champs requis
    if (!landlordId || !tenantId || !propertyId) {
      await trx.rollback();
      return res.status(400).json({ 
        status: 'error',
        message: 'Les champs landlordId, tenantId et propertyId sont obligatoires' 
      });
    }

    console.log('--- Création de contrat ---');
    console.log('ID du propriétaire (landlordId):', landlordId);
    console.log('ID du locataire (tenantId):', tenantId);
    console.log('ID de la propriété (propertyId):', propertyId);

    // Vérifier si le propriétaire existe
    const landlord = await trx('users')
      .where('id', landlordId)
      .where('user_type', 'landlord')
      .first();

    if (!landlord) {
      await trx.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Le propriétaire spécifié est introuvable ou n\'a pas les droits nécessaires'
      });
    }

    // Vérifier si le locataire existe
    const tenant = await trx('users')
      .where('id', tenantId)
      .where('user_type', 'tenant')
      .first();

    if (!tenant) {
      await trx.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Le locataire spécifié est introuvable ou n\'a pas les droits nécessaires'
      });
    }

    // Vérifier si la propriété existe et appartient bien au propriétaire
    const property = await trx('properties')
      .where('id', propertyId)
      .where('landlord_id', landlordId)
      .first();

    if (!property) {
      await trx.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'La propriété spécifiée est introuvable ou n\'appartient pas au propriétaire indiqué'
      });
    }

    // Vérifier si la propriété n'est pas déjà louée pour la période spécifiée
    const existingContract = await trx('contracts')
      .where('property_id', propertyId)
      .whereNot('status', 'terminated')
      .where(function() {
        this.where('end_date', '>=', startDate)
          .orWhereNull('end_date');
      })
      .first();

    if (existingContract) {
      await trx.rollback();
      return res.status(409).json({
        status: 'error',
        message: 'La propriété est déjà louée pour la période spécifiée'
      });
    }

    // Créer le contrat
    const [contractId] = await trx('contracts').insert({
      name: `Contrat ${property.title || 'sans nom'}`,
      property_id: propertyId,
      landlord_id: landlordId,
      tenant_id: tenantId,
      start_date: startDate,
      end_date: endDate,
      rent_amount: rent,
      deposit_amount: deposit,
      currency: currency,
      duration: duration,
      special_conditions: specialConditions,
      status: status,
      payment_day: paymentDay,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Mettre à jour le statut de la propriété
    await trx('properties')
      .where('id', propertyId)
      .update({
        status: 'rented',
        updated_at: new Date()
      });

    // Valider la transaction
    await trx.commit();

    console.log(`Contrat créé avec succès avec l'ID: ${contractId}`);
    
    return res.status(201).json({
      status: 'success',
      message: 'Contrat créé avec succès',
      data: {
        id: contractId,
        name: `Contrat ${property.title || 'sans nom'}`,
        propertyId: propertyId,
        landlordId: landlordId,
        tenantId: tenantId,
        startDate: startDate,
        endDate: endDate,
        rent: rent,
        deposit: deposit,
        currency: currency,
        duration: duration,
        specialConditions: specialConditions,
        status: status,
        paymentDay: paymentDay
      }
    });

  } catch (error: unknown) {
    // Annuler la transaction en cas d'erreur
    try {
      await trx.rollback();
    } catch (rollbackError) {
      console.error('Erreur lors du rollback de la transaction:', rollbackError);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    console.error('Erreur lors de la création du contrat:', errorMessage);
    
    return res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la création du contrat',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// Fonction utilitaire pour trier les contrats par date de début
export function sortContractsByStartDate(a: FormattedContract, b: FormattedContract): number {
  return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
}
