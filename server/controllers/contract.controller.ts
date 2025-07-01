import { Request, Response } from 'express';
import { db } from '../database';

// Définition d'une interface pour étendre le type Request avec l'utilisateur
declare module 'express' {
  interface Request {
    user?: {
      id: string | number;
      // Ajoutez d'autres propriétés utilisateur si nécessaire
    };
  }
}

// Fonction utilitaire pour déterminer le statut du paiement
const getPaymentStatus = (paymentDay: number | null, startDate: string): { status: 'on_time' | 'upcoming' | 'overdue'; days: number } => {
  if (!paymentDay) {
    // Si aucun jour de paiement n'est défini, utiliser le jour de début de contrat
    paymentDay = new Date(startDate).getDate();
  }

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Date du prochain paiement
  let nextPaymentDate = new Date(currentYear, currentMonth, paymentDay);
  
  // Si le jour du mois est déjà passé ce mois-ci, prendre le mois prochain
  if (currentDay > paymentDay) {
    nextPaymentDate = new Date(currentYear, currentMonth + 1, paymentDay);
  }
  
  // Calculer la différence en jours
  const diffTime = nextPaymentDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Déterminer le statut
  if (diffDays === 0) {
    return { status: 'on_time', days: 0 }; // Aujourd'hui
  } else if (diffDays < 0) {
    return { status: 'overdue', days: Math.abs(diffDays) }; // En retard
  } else if (diffDays <= 3) {
    return { status: 'upcoming', days: diffDays }; // Bientôt (dans 3 jours ou moins)
  } else {
    return { status: 'on_time', days: diffDays }; // Dans plus de 3 jours
  }
};

export const getContracts = async (req: Request, res: Response) => {
  console.log('Début de la récupération des contrats...');
  try {
    // Vérifier la connexion à la base de données
    await db.raw('SELECT 1');
    console.log('Connexion à la base de données établie avec succès');
    
    // Récupérer l'ID de l'utilisateur connecté depuis la requête (ajouté par le middleware d'authentification)
    const userId = req.user?.id;
    
    if (!userId) {
      console.error('Aucun utilisateur connecté trouvé');
      return res.status(401).json({ message: 'Non autorisé - Utilisateur non connecté' });
    }
    
    console.log(`Récupération des contrats pour l'utilisateur ID: ${userId}`);
    
    // Récupérer les contrats avec les relations et l'adresse complète
    // Uniquement les contrats où l'utilisateur est le bailleur
    const contracts = await db('contracts')
      .select(
        'contracts.*',
        'landlord.first_name as landlord_first_name',
        'landlord.last_name as landlord_last_name',
        'tenant.first_name as tenant_first_name',
        'tenant.last_name as tenant_last_name',
        'properties.title as property_title',
        'properties.address as property_address'
      )
      .leftJoin('users as landlord', 'contracts.landlord_id', 'landlord.id')
      .leftJoin('users as tenant', 'contracts.tenant_id', 'tenant.id')
      .leftJoin('properties', 'contracts.property_id', 'properties.id')
      .where('contracts.landlord_id', userId); // Filtrer par l'ID du bailleur connecté
    
    console.log(`Nombre de contrats récupérés: ${contracts.length}`);
    
    // Formater les données pour le frontend
    const formattedContracts = contracts.map(contract => {
      console.log('Contrat brut de la base de données:', {
        id: contract.id,
        tenant_id: contract.tenant_id,
        tenant_first_name: contract.tenant_first_name,
        tenant_last_name: contract.tenant_last_name,
        property_id: contract.property_id,
        property_title: contract.property_title
      });

      // Obtenir le statut du paiement
      const paymentStatus = getPaymentStatus(contract.payment_day, contract.start_date);
      
      // Déterminer le message d'alerte en fonction du statut
      let paymentAlert = null;
      switch (paymentStatus.status) {
        case 'on_time':
          if (paymentStatus.days === 0) {
            paymentAlert = {
              type: 'info',
              message: 'Paiement dû aujourd\'hui',
              severity: 'high'
            };
          } else {
            paymentAlert = {
              type: 'info',
              message: `Prochain paiement dans ${paymentStatus.days} jours`,
              severity: 'low'
            };
          }
          break;
        case 'upcoming':
          paymentAlert = {
            type: 'warning',
            message: `Paiement prévu dans ${paymentStatus.days} jours`,
            severity: 'medium'
          };
          break;
        case 'overdue':
          paymentAlert = {
            type: 'error',
            message: `Paiement en retard de ${paymentStatus.days} jours`,
            severity: 'high'
          };
          break;
      }

      const formattedContract = {
        id: contract.id,
        property: contract.property_id ? {
          id: contract.property_id,
          title: contract.property_title,
          address: contract.property_address || ''
        } : null,
        landlord: contract.landlord_id ? {
          id: contract.landlord_id,
          firstName: contract.landlord_first_name,
          lastName: contract.landlord_last_name
        } : null,
        tenant: contract.tenant_id ? {
          id: contract.tenant_id,
          firstName: contract.tenant_first_name,
          lastName: contract.tenant_last_name
        } : null,
        startDate: contract.start_date,
        endDate: contract.end_date,
        paymentDay: contract.payment_day,
        rent: contract.rent,
        deposit: contract.deposit,
        currency: contract.currency,
        duration: contract.duration,
        status: contract.status,
        specialConditions: contract.special_conditions,
        usage: contract.usage,
        paymentStatus: {
          status: paymentStatus.status,
          days: paymentStatus.days,
          alert: paymentAlert
        },
        createdAt: contract.created_at,
        updatedAt: contract.updated_at
      };

      console.log('Contrat formaté:', JSON.stringify({
        id: formattedContract.id,
        tenant: formattedContract.tenant,
        property: formattedContract.property
      }, null, 2));

      return formattedContract;
    });
    
    res.status(200).json(formattedContracts);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error);
    
    // Log détaillé de l'erreur
    if (error instanceof Error) {
      console.error('Détails de l\'erreur:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: (error as any).code,
        detail: (error as any).detail,
        constraint: (error as any).constraint
      });
    }
    
    // Réponse d'erreur détaillée en développement
    const errorResponse = process.env.NODE_ENV === 'development'
      ? { 
          message: 'Erreur lors de la récupération des contrats',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          details: process.env.NODE_ENV === 'development' 
            ? (error as any).detail || error 
            : undefined
        }
      : { message: 'Erreur lors de la récupération des contrats' };
    
    res.status(500).json(errorResponse);
  }
};

export const createContract = async (req: Request, res: Response) => {
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
      currency = 'USD',
      duration = '1 an',
      status = 'draft',
      specialConditions = '',
      usage = 'residentiel',
      paymentDay = null
    } = req.body;

    console.log('--- Création de contrat ---');
    console.log('ID du propriétaire (landlordId):', landlordId);
    console.log('ID du locataire (tenantId):', tenantId);
    console.log('ID de la propriété (propertyId):', propertyId);

    // Récupérer tous les utilisateurs selon leur userType
    console.log('\n=== UTILISATEURS PAR TYPE ===');
    
    // Utilisateurs de type 'landlord'
    const landlords = await trx('users')
      .select('id', 'first_name', 'last_name', 'email', 'user_type')
      .where('user_type', 'landlord');
    
    console.log('\n🔑 BAilleurs (user_type: landlord):');
    landlords.forEach(landlord => {
      console.log(`  - ID: ${landlord.id} | Nom: ${landlord.first_name} ${landlord.last_name} | Email: ${landlord.email}`);
    });

    // Utilisateurs de type 'tenant'
    const tenants = await trx('users')
      .select('id', 'first_name', 'last_name', 'email', 'user_type')
      .where('user_type', 'tenant');
    
    console.log('\n🏠 Locataires (user_type: tenant):');
    tenants.forEach(tenant => {
      console.log(`  - ID: ${tenant.id} | Nom: ${tenant.first_name} ${tenant.last_name} | Email: ${tenant.email}`);
    });

    // Utilisateurs de type 'agent'
    const agents = await trx('users')
      .select('id', 'first_name', 'last_name', 'email', 'user_type')
      .where('user_type', 'agent');
    
    console.log('\n👨‍💼 Agents (user_type: agent):');
    agents.forEach(agent => {
      console.log(`  - ID: ${agent.id} | Nom: ${agent.first_name} ${agent.last_name} | Email: ${agent.email}`);
    });

    // Utilisateurs de type 'admin'
    const admins = await trx('users')
      .select('id', 'first_name', 'last_name', 'email', 'user_type')
      .where('user_type', 'admin');
    
    console.log('\n👑 Administrateurs (user_type: admin):');
    admins.forEach(admin => {
      console.log(`  - ID: ${admin.id} | Nom: ${admin.first_name} ${admin.last_name} | Email: ${admin.email}`);
    });

    // Statistiques
    console.log('\n📊 STATISTIQUES:');
    console.log(`  - Total bailleurs: ${landlords.length}`);
    console.log(`  - Total locataires: ${tenants.length}`);
    console.log(`  - Total agents: ${agents.length}`);
    console.log(`  - Total administrateurs: ${admins.length}`);
    console.log(`  - Total utilisateurs: ${landlords.length + tenants.length + agents.length + admins.length}`);

    console.log('\n=== FIN DES UTILISATEURS ===\n');

    const [newContract] = await trx('contracts').insert({
      landlord_id: landlordId,
      tenant_id: tenantId,
      property_id: propertyId,
      start_date: startDate,
      end_date: endDate,
      rent,
      deposit,
      currency,
      duration,
      status,
      special_conditions: specialConditions,
      usage: req.body.usage || 'residentiel', // Ajout du champ usage avec une valeur par défaut
      payment_day: paymentDay // Ajout du jour de paiement
    }).returning('*');

    await trx.commit();

    res.status(201).json(newContract);

  } catch (error) {
    await trx.rollback();
    console.error('Erreur lors de la création du contrat:', error);
    
    // Log the complete error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: (error as any).code,
        detail: (error as any).detail,
        constraint: (error as any).constraint
      });
    }
    
    // Return more detailed error information in development
    const errorResponse = process.env.NODE_ENV === 'development' 
      ? { 
          message: 'Erreur lors de la création du contrat',
          error: error instanceof Error ? error.message : 'Unknown error',
          details: process.env.NODE_ENV === 'development' ? (error as any).detail || error : undefined
        }
      : { message: 'Erreur lors de la création du contrat' };
      
    res.status(500).json(errorResponse);
  }
};
