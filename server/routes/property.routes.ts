import { Router, Request, Response, NextFunction, RequestHandler, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { authenticateJWT as authenticate } from '../middleware/auth.middleware';
import * as propertyController from '../controllers/property.controller';

// Définir un type pour la fonction de contrôleur avec gestion d'erreur
type AsyncRequestHandler = (req: ExpressRequest, res: ExpressResponse) => Promise<void>;

import { 
  validatePropertyData, 
  propertyExists, 
  isPropertyOwner, 
  canEditProperty, 
  canDeleteProperty 
} from '../middleware/property.middleware';

const router = Router();

// Routes publiques
router.get('/', propertyController.getProperties);
router.get('/available', propertyController.getAvailableProperties);

// Routes protégées (nécessitent une authentification)
router.use(authenticate);

// Routes pour les propriétaires
// Récupérer les propriétés de l'utilisateur connecté
const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => 
  (req, res, next) => {
    Promise.resolve(fn(req, res)).catch(next);
  };

// Récupérer les propriétés de l'utilisateur connecté
router.get('/my-properties', asyncHandler(async (req, res) => {
  await propertyController.getMyProperties(req, res);
}));

// Récupérer une propriété spécifique par son ID
router.get('/:id(\\d+)', propertyExists, isPropertyOwner, asyncHandler(async (req, res) => {
  await propertyController.getPropertyById(req, res);
}));

router.post('/', validatePropertyData, asyncHandler(async (req, res) => {
  await propertyController.createProperty(req, res);
}));

router.put('/:id(\\d+)', 
  propertyExists, 
  isPropertyOwner, 
  canEditProperty, 
  validatePropertyData, 
  asyncHandler(async (req, res) => {
    await propertyController.updateProperty(req, res);
  })
);

router.delete('/:id(\\d+)', 
  propertyExists, 
  isPropertyOwner, 
  canDeleteProperty, 
  asyncHandler(async (req, res) => {
    await propertyController.deleteProperty(req, res);
  })
);

export default router;
