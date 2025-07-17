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

    // Exécution séquentielle des requêtes pour un meilleur débogage
    logger.info(`=== DÉBUT DES REQUÊTES POUR L'AGENT ID: ${userId} ===`);
    
    // 1. Nombre total de propriétés
    logger.info('\n=== REQUÊTE: Nombre total de propriétés ===');
    const totalProperties = await db('properties')
      .where('agent_id', userId)
      .where('is_active', 1)  // Uniquement les propriétés actives
      .count('* as count')
      .first()
      .then((result: any) => {
        const count = result ? parseInt(result.count || '0', 10) : 0;
        const finalCount = isNaN(count) ? 0 : count;
        logger.info(`Résultat: ${finalCount} propriétés trouvées`);
        return finalCount;
      })
      .catch((error: DbError) => {
        logger.error('Erreur lors du comptage des propriétés:', {
          error: error.message,
          userId,
          sql: error.sql
        });
        return 0;
      });

    // 2. Contrats actifs (avec status 'LOUE' ou 'rented' et date de fin non dépassée)
    logger.info('\n=== REQUÊTE: Contrats actifs ===');
    const activeContracts = await db('contracts')
      .where('agent_id', userId)
      .whereIn('status', ['LOUE', 'rented'])  // Les deux statuts possibles pour un contrat actif
      .andWhere(function() {
        this.where('end_date', '>=', db.fn.now())
           .orWhereNull('end_date');
      })
      .count('* as count')
      .first()
      .then((result: any) => {
        const count = result ? parseInt(result.count || '0', 10) : 0;
        const finalCount = isNaN(count) ? 0 : count;
        logger.info(`Résultat: ${finalCount} contrats actifs trouvés`);
        return finalCount;
      })
      .catch((error: DbError) => {
        logger.error('Erreur lors du comptage des contrats actifs:', {
          error: error.message,
          userId,
          sql: error.sql
        });
        return 0;
      });

    // 3. Nombre de locataires uniques avec contrats actifs
    logger.info('\n=== REQUÊTE: Nombre de locataires uniques ===');
    const totalTenants = await db('contracts')
      .distinct('tenant_id')
      .where('agent_id', userId)
      .whereIn('status', ['LOUE', 'rented'])  // Uniquement les locataires avec contrats actifs
      .andWhere(function() {
        this.where('end_date', '>=', db.fn.now())
           .orWhereNull('end_date');
      })
      .count('* as count')
      .first()
      .then((result: any) => {
        const count = result ? parseInt(result.count || '0', 10) : 0;
        const finalCount = isNaN(count) ? 0 : count;
        logger.info(`Résultat: ${finalCount} locataires uniques trouvés`);
        return finalCount;
      })
      .catch((error: DbError) => {
        logger.error('Erreur lors du comptage des locataires uniques:', {
          error: error.message,
          userId,
          sql: error.sql
        });
        return 0;
      });

    // 4. Nombre de bailleurs uniques avec propriétés actives
    logger.info('\n=== REQUÊTE: Nombre de bailleurs uniques ===');
    const totalLandlords = await db('properties')
      .distinct('owner_id')
      .where('agent_id', userId)
      .where('is_active', 1)  // Uniquement les propriétés actives
      .count('* as count')
      .first()
      .then((result: any) => {
        const count = result ? parseInt(result.count || '0', 10) : 0;
        const finalCount = isNaN(count) ? 0 : count;
        logger.info(`Résultat: ${finalCount} bailleurs uniques trouvés`);
        return finalCount;
      })
      .catch((error: DbError) => {
        logger.error('Erreur lors du comptage des bailleurs uniques:', {
          error: error.message,
          userId,
          sql: error.sql
        });
        return 0;
      });
    
    logger.info('\n=== RÉCAPITULATIF DES DONNÉES ===');
    logger.info(`- Propriétés: ${totalProperties}`);
    logger.info(`- Contrats actifs: ${activeContracts}`);
    logger.info(`- Locataires uniques: ${totalTenants}`);
    logger.info(`- Bailleurs uniques: ${totalLandlords}`);
    
    // Mettre à jour les données de la réponse
    response.data = {
      totalProperties: totalProperties || 0,
      activeContracts: activeContracts || 0,
      totalTenants: totalTenants || 0,
      totalLandlords: totalLandlords || 0,
      recentTransactions: [],
      upcomingVisits: []
    };

    // Afficher les requêtes SQL pour référence
    logger.info('\n=== REQUÊTES SQL POUR RÉFÉRENCE ===');
    logger.info('1. Propriétés totales:');
    logger.info('   SELECT COUNT(*) as count FROM properties WHERE agent_id = ?', [userId]);
    
    logger.info('\n2. Contrats actifs:');
    logger.info('   SELECT COUNT(*) as count FROM contracts WHERE agent_id = ? AND (end_date >= CURRENT_TIMESTAMP OR end_date IS NULL)', [userId]);
    
    logger.info('\n3. Locataires uniques:');
    logger.info('   SELECT COUNT(DISTINCT tenant_id) as count FROM contracts WHERE agent_id = ?', [userId]);
    
    logger.info('\n4. Bailleurs uniques:');
    logger.info('   SELECT COUNT(DISTINCT owner_id) as count FROM properties WHERE agent_id = ?', [userId]);
    
    // Log des données finales
    logger.info('\n=== DONNÉES FINALES À ENVOYER ===');
    logger.info(JSON.stringify({
      success: true,
      data: {
        totalProperties,
        activeContracts,
        totalTenants,
        totalLandlords,
        recentTransactions: [],
        upcomingVisits: []
      }
    }, null, 2));

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
