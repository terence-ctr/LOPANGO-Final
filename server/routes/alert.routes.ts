import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { 
  getAlerts, 
  createAlert, 
  updateAlert, 
  deleteAlert 
} from '../controllers/alert.controller';

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateJWT);

// Routes pour les alertes
router.route('/')
  .get(getAlerts)         // Récupérer les alertes avec filtres
  .post(createAlert);     // Créer une nouvelle alerte

router.route('/:id')
  .put(updateAlert)       // Mettre à jour une alerte
  .delete(deleteAlert);   // Supprimer une alerte

export const alertRoutes = router;
