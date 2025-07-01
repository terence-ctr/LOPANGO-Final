import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { 
  getPayments, 
  createPayment, 
  updatePayment, 
  deletePayment 
} from '../controllers/payment.controller';

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateJWT);

// Routes pour les paiements
router.route('/')
  .get(getPayments)         // Récupérer les paiements avec filtres
  .post(createPayment);     // Créer un nouveau paiement

router.route('/:id')
  .put(updatePayment)       // Mettre à jour un paiement
  .delete(deletePayment);   // Supprimer un paiement

export const paymentRoutes = router;
