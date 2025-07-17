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
  owner_id: number;
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
}

interface LocalContractQueryResult {
  // Champs de la table contracts
  id: number;
  property_id: number;
  tenant_id: number;
  owner_id: number;
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
  
  // Champs joints depuis d'autres tables
  property_title?: string;
  property_street?: string;
  property_city?: string;
  property_postal_code?: string;
  property_country?: string;
  landlord_first_name?: string;
  landlord_last_name?: string;
  landlord_email?: string;
  agent_first_name?: string;
  agent_last_name?: string;
  agent_email?: string;
  tenant_first_name?: string;
  tenant_last_name?: string;
  tenant_email?: string;
}

interface FormattedContract {
  id: number;
  name: string;
  property: {
    id: number;
    title: string;
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
  
  try {
    console.log(`Utilisateur connecté: ID=${userId}, Type=${userType}`);

    // Récupérer les paramètres de requête
    const { status, sortBy = 'start_date', sortOrder = 'desc' } = req.query;
    console.log('Paramètres de requête:', { status, sortBy, sortOrder });

    // Construire la requête de base
    console.log('Construction de la requête de base...');
    
    // Récupérer les contrats avec les informations de base
    let contractsQuery = db('contracts as c')
      .select('c.*')
      .whereNot('c.status', 'deleted')
      .orderBy(sortBy, sortOrder);
      
    // Filtrer en fonction du type d'utilisateur
    if (userType === 'tenant') {
      console.log(`Filtrage pour locataire (ID: ${userId})`);
      contractsQuery = contractsQuery.where('tenant_id', userId);
    } else if (userType === 'landlord') {
      console.log(`Filtrage pour propriétaire (ID: ${userId})`);
      contractsQuery = contractsQuery.where('landlord_id', userId);
    } else if (userType !== 'admin') {
      // Si l'utilisateur n'est ni admin, ni propriétaire, ni locataire, on ne retourne rien
      console.log('Utilisateur non autorisé à voir les contrats');
      return res.status(200).json({ status: 'success', data: [] });
    }

    // Filtrer par statut si spécifié
    if (status) {
      console.log(`Filtrage par statut: ${status}`);
      contractsQuery = contractsQuery.where('status', status);
    }

    // Exécuter la requête pour obtenir les contrats
    console.log('Exécution de la requête de récupération des contrats...');
    
    // Ajouter les jointures nécessaires pour récupérer les informations de l'agent
    contractsQuery = contractsQuery
      .leftJoin('users as a', 'c.agent_id', 'a.id')
      .select([
        'c.*',
        'a.id as agent_id',
        'a.first_name as agent_first_name',
        'a.last_name as agent_last_name',
        'a.email as agent_email'
      ]);
    
    const sql = contractsQuery.toSQL().toNative();
    console.log('Requête SQL complète:', sql);
    
    let contracts;
    try {
      contracts = await contractsQuery;
      console.log(`Nombre de contrats trouvés: ${contracts.length}`);
      
      // Afficher les données brutes des contrats pour débogage
      console.log('\n=== DONNÉES BRUTES DES CONTRATS ===');
      contracts.forEach((contract, index) => {
        console.log(`\nContrat #${index + 1}:`);
        console.log('- ID:', contract.id);
        console.log('- Agent ID:', contract.agent_id);
        console.log('- Agent Nom Complet:', `${contract.agent_first_name || ''} ${contract.agent_last_name || ''}`.trim() || 'Non spécifié');
        console.log('- Données brutes:', JSON.stringify(contract, null, 2));
      });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la récupération des contrats:', errorMessage);
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la récupération des contrats',
        error: errorMessage
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
    
    // Afficher les colonnes et valeurs pour le premier contrat
    console.log('\n=== VALEURS DU PREMIER CONTRAT ===');
    const sampleContract = contracts[0];
    console.log('Colonnes disponibles dans la table contracts:');
    Object.keys(sampleContract).forEach(key => {
      console.log(`- ${key}:`, sampleContract[key]);
    });
    
    // Vérifier et afficher les champs spécifiques
    console.log('\nChamps spécifiques:');
    console.log('- property_name:', sampleContract.property_name);
    console.log('- property_address:', sampleContract.property_address);
    console.log('- property_status:', sampleContract.property_status);
    console.log('==============================\n');
    
    console.log('Récupération des informations supplémentaires pour chaque contrat...');
    const enrichedContracts = contracts.map(contract => ({
      ...contract,
      property_title: contract.property_name || 'Propriété sans nom',
      property_address: contract.property_address || 'Adresse non disponible',
      property_status: contract.property_status || 'inconnu'
    }));
    
    console.log('Contrats enrichis avec succès');
    
    // Formater les données pour le frontend
    console.log('Formatage des données pour le frontend...');
    const formattedContracts = enrichedContracts.map(contract => {
      // Parser l'adresse complète en composants individuels
      const addressParts = (contract.property_address || '').split(',').map((part: string) => part.trim());
      const [street, city, postal_code, country] = addressParts;
      
      // Préparer l'objet agent s'il y a un agent_id
      let agent = null;
      if (contract.agent_id) {
        agent = {
          id: contract.agent_id,
          firstName: contract.agent_first_name || '',
          lastName: contract.agent_last_name || '',
          email: contract.agent_email || ''
        };
        console.log(`Agent pour le contrat ${contract.id}:`, agent);
      } else {
        console.log(`Aucun agent pour le contrat ${contract.id}`);
      }
      
      return {
        id: contract.id,
        landlord_id: contract.landlord_id,
        tenant_id: contract.tenant_id,
        property_id: contract.property_id,
        agent_id: contract.agent_id, // Ajouter l'ID de l'agent au niveau racine
        property: {
          id: contract.property_id,
          title: contract.property_name || 'Propriété sans nom',
          // Structure d'adresse standardisée
          address: {
            street: street || '',
            city: city || '',
            postal_code: postal_code || '',
            country: country || 'Congo',
            // Adresse complète pour la rétrocompatibilité
            full_address: contract.property_address || ''
          },
          type: contract.usage || 'inconnu',
          rent: contract.rent || 0,
          deposit: contract.deposit || 0,
          currency: contract.currency || 'USD',
          status: contract.property_status || 'inconnu',
          // Inclure l'agent dans la propriété
          agent: agent
        },
        start_date: contract.start_date,
        end_date: contract.end_date,
        rent: contract.rent || 0,
        deposit: contract.deposit || 0,
        deposit_status: contract.deposit_status || 'non payé',
        currency: contract.currency || 'USD',
        duration: contract.duration,
        status: contract.status,
        special_conditions: contract.special_conditions || '',
        payment_day: contract.payment_day,
        // Inclure l'agent au niveau racine également pour la rétrocompatibilité
        agent: agent,
        usage: contract.usage || 'inconnu',
        created_at: contract.created_at || new Date().toISOString(),
        updated_at: contract.updated_at || new Date().toISOString(),
        // Propriétés dépréciées (à supprimer après mise à jour du frontend)
        property_name: contract.property_name,
        property_address: contract.property_address,
        property_status: contract.property_status
      };
    });
    
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
 * Récupère les contrats d'un agent spécifique
 */
export const getAgentContracts = async (req: LocalContractRequest, res: Response): Promise<Response> => {
  const requestId = req.headers['x-request-id'] || 'no-request-id';
  const logContext = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    params: req.params,
    query: req.query,
    user: req.user ? { 
      id: req.user.id, 
      email: req.user.email, 
      userType: req.user.userType 
    } : 'non authentifié'
  };

  console.log(`[${new Date().toISOString()}] [${requestId}] [ContractController] getAgentContracts - Début de la requête`, logContext);
  
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [ContractController] Erreur: Utilisateur non authentifié`);
      return res.status(401).json({ 
        success: false, 
        message: 'Authentification requise' 
      });
    }

    // Récupérer l'ID de l'agent depuis les paramètres de la requête
    const agentId = parseInt(req.params.agentId, 10);
    
    // Vérifier que l'ID de l'agent est valide
    if (isNaN(agentId)) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [ContractController] Erreur: ID agent invalide:`, req.params.agentId);
      return res.status(400).json({ 
        success: false, 
        message: 'ID agent invalide' 
      });
    }
    
    console.log(`[ContractController] Récupération des contrats pour l'agent ID: ${agentId}`);
    
    // Vérifier si l'utilisateur a le droit d'accéder à ces contrats
    if (req.user.userType !== 'admin' && req.user.id !== agentId) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [ContractController] Erreur: Accès non autorisé pour l'utilisateur:`, {
        userId: req.user.id,
        userType: req.user.userType,
        requestedAgentId: agentId
      });
      
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé à accéder à ces contrats',
        error: 'FORBIDDEN',
        details: {
          requiredRole: 'admin ou propriétaire',
          userRole: req.user.userType,
          isOwner: req.user.id === agentId
        }
      });
    }
    
    console.log(`[${new Date().toISOString()}] [${requestId}] [ContractController] Récupération des contrats pour l'agent ID: ${agentId}`);
    
    // Exécuter la requête pour récupérer les contrats
    console.log(`[${new Date().toISOString()}] [${requestId}] [ContractController] Exécution de la requête pour l'agent ID: ${agentId}`);
    
    const contracts = await db('contracts')
      .select(
        'contracts.*',
        'properties.title as property_title',
        'properties.address as property_address',
        'properties.city as property_city',
        'properties.postal_code as property_postal_code',
        'properties.country as property_country',
        'landlords.first_name as landlord_first_name',
        'landlords.last_name as landlord_last_name',
        'landlords.email as landlord_email',
        'agents.first_name as agent_first_name',
        'agents.last_name as agent_last_name',
        'agents.email as agent_email',
        'tenants.first_name as tenant_first_name',
        'tenants.last_name as tenant_last_name',
        'tenants.email as tenant_email'
      )
      .leftJoin('properties', 'contracts.property_id', 'properties.id')
      .leftJoin('users as landlords', 'properties.owner_id', 'landlords.id')
      .leftJoin('users as agents', 'contracts.agent_id', 'agents.id')
      .leftJoin('users as tenants', 'contracts.tenant_id', 'tenants.id')
      .where('contracts.agent_id', agentId);
      
    console.log(`[${new Date().toISOString()}] [${requestId}] [ContractController] ${contracts.length} contrats trouvés pour l'agent ID: ${agentId}`);
    
    if (!contracts || contracts.length === 0) {
      console.log(`[${new Date().toISOString()}] [${requestId}] [ContractController] Aucun contrat trouvé pour l'agent ID: ${agentId}`);
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Formater les contrats pour la réponse
    console.log(`[${new Date().toISOString()}] [${requestId}] [ContractController] Formatage de ${contracts.length} contrats...`);
    const formattedContracts = contracts.map(contract => {
      const paymentStatus = getPaymentStatus(contract.payment_day, contract.start_date);
      
      const property = {
        id: contract.property_id,
        title: contract.property_title || 'Sans titre',
        address: {
          street: contract.property_address || '',
          city: contract.property_city || '',
          postalCode: contract.property_postal_code || '',
          country: contract.property_country || ''
        },
        landlord: {
          id: contract.owner_id,
          firstName: contract.landlord_first_name || '',
          lastName: contract.landlord_last_name || '',
          email: contract.landlord_email || ''
        },
        agent: contract.agent_id ? {
          id: contract.agent_id,
          firstName: contract.agent_first_name || '',
          lastName: contract.agent_last_name || '',
          email: contract.agent_email || ''
        } : null
      };

      const formattedContract: FormattedContract = {
        id: contract.id,
        name: `Contrat #${contract.id}`,
        property,
        tenant: {
          id: contract.tenant_id,
          firstName: contract.tenant_first_name || '',
          lastName: contract.tenant_last_name || '',
          email: contract.tenant_email || ''
        },
        agent: contract.agent_id ? {
          id: contract.agent_id,
          firstName: contract.agent_first_name || '',
          lastName: contract.agent_last_name || '',
          email: contract.agent_email || ''
        } : null,
        startDate: contract.start_date,
        endDate: contract.end_date,
        status: contract.status,
        paymentStatus: paymentStatus.status,
        paymentDays: paymentStatus.days,
        paymentAlert: paymentStatus.alert,
        rentAmount: contract.rent_amount,
        depositAmount: contract.deposit_amount,
        depositStatus: contract.deposit_status,
        paymentDay: contract.payment_day,
        createdAt: contract.created_at,
        updatedAt: contract.updated_at
      };
      
      console.log(`[ContractController] Contrat formaté ID: ${formattedContract.id}`, {
        property: formattedContract.property.title,
        tenant: `${formattedContract.tenant.firstName} ${formattedContract.tenant.lastName}`,
        status: formattedContract.status,
        paymentStatus: formattedContract.paymentStatus
      });
      
      return formattedContract;
    });
    
    console.log(`[${new Date().toISOString()}] [${requestId}] [ContractController] ${formattedContracts.length} contrats formatés avec succès`);
    
    // Trier les contrats par date de début
    const sortedContracts = formattedContracts.sort(sortContractsByStartDate);
    
    // Préparer la réponse
    const responseData = {
      success: true,
      data: sortedContracts,
      meta: {
        total: sortedContracts.length,
        active: sortedContracts.filter(c => c.status === 'active').length,
        pending: sortedContracts.filter(c => c.status === 'pending').length,
        ended: sortedContracts.filter(c => c.status === 'ended').length
      }
    };
    
    console.log(`[${new Date().toISOString()}] [${requestId}] [ContractController] Envoi de la réponse avec succès`, {
      totalContracts: responseData.meta.total,
      active: responseData.meta.active,
      pending: responseData.meta.pending,
      ended: responseData.meta.ended
    });
    
    return res.status(200).json(responseData);
    
  } catch (error: unknown) {
    const errorContext = {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : 'Erreur inconnue',
      request: {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        user: req.user ? { 
          id: req.user.id, 
          email: req.user.email, 
          userType: req.user.userType 
        } : 'non authentifié'
      },
      timestamp: new Date().toISOString()
    };

    console.error(`[${new Date().toISOString()}] [${requestId}] [ContractController] Erreur lors de la récupération des contrats de l'agent:`, errorContext);

    // Log des erreurs de base de données
    if (error && typeof error === 'object') {
      const dbError = error as any;
      if ('code' in dbError) {
        console.error(`[${new Date().toISOString()}] [${requestId}] [ContractController] Erreur base de données:`, {
          code: dbError.code,
          errno: dbError.errno,
          sqlMessage: dbError.message,
          sql: dbError.sql,
          sqlState: dbError.sqlState
        });
      }
    }
    
    // Préparer la réponse d'erreur
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse: any = {
      success: false,
      message: 'Une erreur est survenue lors de la récupération des contrats',
      error: 'INTERNAL_SERVER_ERROR',
      requestId
    };
    
    // Ajouter des détails de débogage en développement
    if (isDevelopment) {
      errorResponse.debug = {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        type: error?.constructor?.name,
        timestamp: new Date().toISOString()
      };
      
      // Ne pas exposer la stack trace en production
      if (error instanceof Error) {
        errorResponse.debug.stack = error.stack;
      }
    }
    
    return res.status(500).json(errorResponse);
  }
};

/**
 * Crée un nouveau contrat
 */
/**
 * Récupère la liste des agents immobiliers
 */
export const getAgents = async (req: Request, res: Response): Promise<Response> => {
  try {
    const agents = await db('users')
      .select('id', 'first_name as firstName', 'last_name as lastName', 'email', 'phone')
      .where('user_type', 'agent')
      .where('is_active', true)
      .orderBy('last_name', 'asc');

    return res.status(200).json({
      status: 'success',
      data: agents
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la récupération des agents'
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
      .where('owner_id', landlordId) // Changé de landlord_id à owner_id
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
      .whereNotIn('status', ['terminated', 'rejected', 'cancelled'])
      .where(function() {
        this.where('end_date', '>=', startDate)
          .orWhereNull('end_date');
      })
      .first();

    if (existingContract) {
      // Vérifier si le contrat existant est expiré
      const isExpired = existingContract.end_date && new Date(existingContract.end_date) < new Date();
      
      if (!isExpired) {
        await trx.rollback();
        
        // Récupérer les détails de la propriété pour le message d'erreur
        const property = await trx('properties')
          .where('id', propertyId)
          .first();
        
        return res.status(409).json({
          status: 'error',
          code: 'PROPERTY_ALREADY_RENTED',
          message: 'Cette propriété est déjà louée',
          details: {
            propertyTitle: property?.title || 'Propriété inconnue',
            propertyId: propertyId,
            contractId: existingContract.id,
            status: existingContract.status,
            endDate: existingContract.end_date 
              ? new Date(existingContract.end_date).toLocaleDateString('fr-FR')
              : 'Date de fin non définie'
          },
          userMessage: `La propriété "${property?.title || ''}" est déjà louée jusqu'au ${
            existingContract.end_date 
              ? new Date(existingContract.end_date).toLocaleDateString('fr-FR')
              : 'une date ultérieure'
          }`
        });
      } else {
        // Mettre à jour le statut du contrat expiré
        await trx('contracts')
          .where('id', existingContract.id)
          .update({
            status: 'terminated',
            updated_at: new Date()
          });
      }
    }

    // Récupérer et valider l'agent_id s'il est fourni
    const agentId = req.body.agentId ? parseInt(req.body.agentId, 10) : null;
    
    if (!agentId) {
      await trx.rollback();
      return res.status(400).json({
        status: 'error',
        code: 'AGENT_REQUIRED',
        message: 'Un agent immobilier est requis pour la création du contrat'
      });
    }

    // Vérifier si l'agent existe et a les droits
    console.log('Recherche de l\'agent avec ID:', agentId);
    const agent = await trx('users')
      .where('id', agentId)
      .where('user_type', 'agent')
      .first();
    
    if (!agent) {
      console.error('Agent non trouvé ou n\'est pas un agent:', agentId);
      await trx.rollback();
      return res.status(404).json({
        status: 'error',
        code: 'AGENT_NOT_FOUND',
        message: 'L\'agent immobilier spécifié est introuvable ou n\'a pas les droits nécessaires'
      });
    }
    console.log('Agent trouvé:', agent);
    console.log('Type de l\'ID de l\'agent:', typeof agentId, 'Valeur:', agentId);

    // Récupérer les informations de la propriété
    const propertyData = await trx('properties')
      .where('id', propertyId)
      .first();

    if (!propertyData) {
      await trx.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'La propriété spécifiée est introuvable'
      });
    }

    // Préparer les données du contrat
    console.log('Préparation des données du contrat - agent_id:', agentId);
    const contractData: any = {
      property_id: propertyId,
      tenant_id: tenantId,
      landlord_id: landlordId,
      agent_id: agentId, // On est sûr que agentId n'est pas null grâce aux validations précédentes
      start_date: startDate,
      end_date: endDate,
      rent: parseFloat(rent), // Assurez-vous que c'est un nombre
      deposit: parseFloat(deposit), // Assurez-vous que c'est un nombre
      currency,
      duration: duration,
      special_conditions: specialConditions,
      status: status,
      payment_day: paymentDay,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Valider et formater les informations de la propriété
    if (!propertyData.title) {
      await trx.rollback();
      return res.status(400).json({
        status: 'error',
        code: 'PROPERTY_TITLE_REQUIRED',
        message: 'Le titre de la propriété est requis'
      });
    }

    const propertyAddress = [
      propertyData.street,
      propertyData.city,
      propertyData.postal_code,
      propertyData.country
    ].filter(Boolean).join(', ');

    if (!propertyAddress) {
      await trx.rollback();
      return res.status(400).json({
        status: 'error',
        code: 'PROPERTY_ADDRESS_REQUIRED',
        message: 'L\'adresse complète de la propriété est requise'
      });
    }

    // Ajouter les informations de la propriété au contrat
    contractData.property_name = propertyData.title;
    contractData.property_address = propertyAddress;
    contractData.property_status = propertyData.status || 'active';

    // Ajouter l'usage si disponible
    if (req.body.usage) {
      contractData.usage = req.body.usage;
    }
    
    console.log('Données du contrat avant insertion:', JSON.stringify(contractData, null, 2));

    // Insérer le contrat
    console.log('Insertion du contrat avec les données:', JSON.stringify(contractData, null, 2));
    let contractId;
    try {
      [contractId] = await trx('contracts').insert(contractData).returning('id');
      console.log('Contrat inséré avec ID:', contractId);
      console.log('agent_id inséré dans le contrat:', contractData.agent_id);
    } catch (error) {
      console.error('Erreur lors de l\'insertion du contrat:', error);
      throw error; // La transaction sera rollback automatiquement
    }

    // Mettre à jour la propriété avec les IDs du locataire et de l'agent
    console.log('Mise à jour de la propriété - agent_id:', agentId);
    const propertyUpdateData: any = {
      status: 'rented',
      updated_at: new Date(),
      tenant_id: tenantId,
      agent_id: agentId // On est sûr que agentId n'est pas null grâce aux validations précédentes
    };

    console.log('Données de mise à jour de la propriété:', JSON.stringify(propertyUpdateData, null, 2));

    // Mettre à jour la propriété
    try {
      const updated = await trx('properties')
        .where('id', propertyId)
        .update(propertyUpdateData);
      
      console.log('Propriété mise à jour:', updated, 'lignes affectées');
      
      // Vérifier que l'agent a bien été mis à jour
      const updatedProperty = await trx('properties')
        .where('id', propertyId)
        .first();
      
      console.log('Propriété après mise à jour - agent_id:', updatedProperty?.agent_id);
      
      // Valider la transaction
      await trx.commit();
      
      console.log('Transaction validée avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la propriété:', error);
      throw error; // La transaction sera rollback automatiquement
    }

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
        agentId: agentId || null,
        propertyName: contractData.property_name,
        propertyAddress: contractData.property_address,
        propertyStatus: contractData.property_status,
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
    const errorStack = error instanceof Error ? error.stack : 'Pas de stack trace disponible';
    
    console.error('=== ERREUR LORS DE LA CRÉATION DU CONTRAT ===');
    console.error('Message:', errorMessage);
    console.error('Stack:', errorStack);
    
    if (error instanceof Error && 'code' in error) {
      console.error('Code d\'erreur SQL:', (error as any).code);
    }
    
    if (error instanceof Error && 'sqlMessage' in error) {
      console.error('Message SQL:', (error as any).sqlMessage);
    }
    
    if (error instanceof Error && 'sql' in error) {
      console.error('Requête SQL:', (error as any).sql);
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la création du contrat',
      error: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        stack: errorStack,
        ...(error && typeof error === 'object' ? error : {})
      } : undefined
    });
  }
};

// Fonction utilitaire pour trier les contrats par date de début
export function sortContractsByStartDate(a: FormattedContract, b: FormattedContract): number {
  return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
}
