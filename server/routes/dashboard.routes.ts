import { Router } from 'express';
import { getAgentDashboard } from '../controllers/dashboard.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Middleware pour vérifier le rôle de l'utilisateur
const checkAgentRole = (req: any, res: any, next: any) => {
  if (req.user?.userType !== 'agent') {
    return res.status(403).json({ 
      success: false, 
      message: 'Accès non autorisé. Réservé aux agents.' 
    });
  }
  next();
};

/**
 * @route   GET /api/dashboard/agent
 * @desc    Récupère les statistiques du tableau de bord pour un agent
 * @access  Privé (Agent)
 */
router.get('/agent', authenticateJWT, checkAgentRole, getAgentDashboard);

export default router;
