import { Request, Response } from 'express';
import { db } from '../database/db';
import { logger } from '../utils/logger';

// Interface pour les erreurs de base de données
interface DbError extends Error {
  code?: string;
  errno?: number;
  sqlMessage?: string;
  sqlState?: string;
  sql?: string;
}

// Interface pour les données du tableau de bord
interface DashboardData {
  totalProperties: number;
  activeContracts: number;
  totalTenants: number;
  totalLandlords: number;
  recentTransactions: any[];
  upcomingVisits: any[];
}

/**
 * Récupère les statistiques du tableau de bord pour un agent
 */
export const getAgentDashboard = async (req: Request, res: Response): Promise<void> => {
  // Déclarer la réponse ici pour éviter les erreurs de type
  const response = {
    success: true,
    data: {
      totalProperties: 0,
      activeContracts: 0,
      totalTenants: 0,
      totalLandlords: 0,
      recentTransactions: [],
      upcomingVisits: []
    } as DashboardData
  };
  // Récupérer l'ID de l'utilisateur connecté depuis req.user
  const userId = req.user?.id;
  
  if (!userId) {
    logger.error('ID utilisateur manquant dans la requête');
    res.status(400).json({
      success: false,
      message: 'ID utilisateur manquant',
    });
    return;
  }

  logger.info(`Récupération du tableau de bord pour l'agent ID: ${userId}`);

  try {
    // Vérifier la connexion à la base de données
    await db.raw('SELECT 1');
    logger.debug('Connexion à la base de données établie avec succès');

    // Exécution en parallèle des requêtes
    const [
      totalProperties,
      activeContracts,
      totalTenants,
      totalLandlords
    ] = await Promise.all([
      // Nombre total de propriétés gérées par l'agent
      db('properties')
        .where('agent_id', userId)
        .count('* as count')
        .first()
        .then((result: any) => {
          if (!result) return 0;
          const count = parseInt(result.count || '0', 10);
          return isNaN(count) ? 0 : count;
        })
        .catch((error: DbError) => {
          logger.error('Erreur lors du comptage des propriétés:', {
            error: error.message,
            userId,
            sql: error.sql
          });
          return 0;
        }),
      
      // Nombre de contrats actifs (non expirés ou sans date de fin)
      db('contracts')
        .where('agent_id', userId)
        .andWhere(function() {
          this.where('end_date', '>=', db.fn.now())
             .orWhereNull('end_date');
        })
        .count('* as count')
        .first()
        .then((result: any) => {
          if (!result) return 0;
          const count = parseInt(result.count || '0', 10);
          return isNaN(count) ? 0 : count;
        })
        .catch((error: DbError) => {
          logger.error('Erreur lors du comptage des contrats actifs:', {
            error: error.message,
            userId,
            sql: error.sql
          });
          return 0;
        }),
      
      // Nombre de locataires uniques
      db('contracts')
        .distinct('tenant_id')
        .where('agent_id', userId)
        .count('* as count')
        .first()
        .then((result: any) => {
          if (!result) return 0;
          const count = parseInt(result.count || '0', 10);
          return isNaN(count) ? 0 : count;
        })
        .catch((error: DbError) => {
          logger.error('Erreur lors du comptage des locataires uniques:', {
            error: error.message,
            userId,
            sql: error.sql
          });
          return 0;
        }),
      
      // Nombre de bailleurs uniques
      db('properties')
        .distinct('owner_id')
        .where('agent_id', userId)
        .count('* as count')
        .first()
        .then((result: any) => {
          if (!result) return 0;
          const count = parseInt(result.count || '0', 10);
          return isNaN(count) ? 0 : count;
        })
        .catch((error: DbError) => {
          logger.error('Erreur lors du comptage des bailleurs uniques:', {
            error: error.message,
            userId,
            sql: error.sql
          });
          return 0;
        })
    ]);

    // Mettre à jour les données de la réponse
    response.data = {
      totalProperties: totalProperties || 0,
      activeContracts: activeContracts || 0,
      totalTenants: totalTenants || 0,
      totalLandlords: totalLandlords || 0,
      recentTransactions: [],
      upcomingVisits: []
    };

    logger.info(`Tableau de bord récupéré avec succès pour l'agent ID: ${userId}`);
    res.status(200).json(response);
    
  } catch (error: any) {
    logger.error('Erreur lors de la récupération du tableau de bord:', {
      error: error.message,
      stack: error.stack,
      ...(error.sql && { sql: error.sql })
    });
    
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération du tableau de bord',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
