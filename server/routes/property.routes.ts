import { Router } from 'express';
import propertyController from '../controllers/properties/property.controller';
import { authenticate } from '../middleware/auth.middleware';
import { checkUserType } from '../middleware/checkUserType.middleware'; // Assurez-vous que ce fichier existe
import { UserType } from '../utils/enums/user.enum';

const router = Router();

// Routes publiques (sans authentification)
router.get('/search', (req, res, next) => propertyController.search(req, res, next));
router.get('/:id', (req, res, next) => propertyController.findById(req, res, next));

// Middleware d'authentification pour les routes protégées
router.use(authenticate);

// Routes pour les propriétaires
router.get('/owner/my-properties', 
  checkUserType([UserType.LANDLORD, UserType.ADMIN]), 
  (req, res, next) => propertyController.getMyProperties(req, res, next)
);

// Création de propriété (propriétaire ou admin)
router.post('/', 
  checkUserType([UserType.LANDLORD, UserType.ADMIN]), 
  (req, res, next) => propertyController.create(req, res, next)
);

// Mise à jour de propriété (propriétaire ou admin)
router.put('/:id', 
  checkUserType([UserType.LANDLORD, UserType.ADMIN]), 
  (req, res, next) => propertyController.update(req, res, next)
);

// Suppression de propriété (admin uniquement)
router.delete('/:id', 
  checkUserType([UserType.ADMIN]), 
  (req, res, next) => propertyController.delete(req, res, next)
);

// Approuver/Rejeter une propriété (admin uniquement)
router.post('/:id/approve', 
  checkUserType([UserType.ADMIN]), 
  (req, res, next) => propertyController.approveProperty(req, res, next)
);

// Récupération des propriétés avec filtres (accessible à tous les utilisateurs authentifiés)
router.get('/', (req, res, next) => propertyController.findAll(req, res, next));

export default router;
