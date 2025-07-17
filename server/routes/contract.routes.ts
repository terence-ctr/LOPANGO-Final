import { Router, RequestHandler } from 'express';
import { authenticateJWT as authenticate } from '../middleware/auth.middleware';
import * as contractController from '../controllers/contract.controller';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticate as RequestHandler);

// Récupérer les contrats de l'utilisateur connecté (bailleur)
router.get('/', (req, res, next) => {
  contractController.getTenantContracts(req, res).catch(next);
});

// Récupérer les contrats du locataire connecté
router.get('/tenant/me', (req, res, next) => {
  contractController.getTenantContracts(req, res).catch(next);
});

// Récupérer les contrats du propriétaire connecté
router.get('/landlord/me', (req, res, next) => {
  contractController.getTenantContracts(req, res).catch(next);
});

// Récupérer les contrats d'un locataire spécifique (pour les administrateurs)
router.get('/tenants/:tenantId/contracts', (req, res, next) => {
  contractController.getTenantContracts(req, res).catch(next);
});

// Créer un nouveau contrat
router.post('/', (req, res, next) => {
  contractController.createContract(req, res).catch(next);
});

// Récupérer les contrats d'un agent spécifique
router.get('/agent/:agentId', (req, res, next) => {
  contractController.getAgentContracts(req, res).catch(next);
});

// Récupérer la liste des agents immobiliers
router.get('/agents', (req, res, next) => {
  contractController.getAgents(req, res).catch(next);
});

// Route pour créer un paiement
router.post('/payments', (req, res, next) => {
  paymentController.createPayment(req, res).catch(next);
});
// Route pour lister les paiements
router.get('/payments', (req, res, next) => {
  paymentController.getPayments(req, res).catch(next);
});

// Gestion des erreurs globales
router.use((err: any, req: any, res: any, next: any) => {
  console.error('Erreur dans la route des contrats:', err);
  res.status(500).json({
    status: 'error',
    message: 'Une erreur est survenue lors du traitement de votre demande',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default router;
