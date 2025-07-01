import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticateJWT as authenticate } from '../middleware/auth.middleware';
import * as propertyController from '../controllers/property.controller';

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

// Routes protégées (nécessitent une authentification)
router.use(authenticate);

// Routes pour les propriétaires
// Récupérer les propriétés de l'utilisateur connecté
const getMyPropertiesHandler: RequestHandler = (req, res, next) => {
  return (propertyController.getMyProperties as any)(req, res).catch(next);
};
router.get('/my-properties', getMyPropertiesHandler);

// Récupérer une propriété spécifique par son ID
router.get('/:id(\\d+)', propertyExists, isPropertyOwner, propertyController.getPropertyById);
router.post('/', validatePropertyData, propertyController.createProperty);
router.put('/:id(\\d+)', 
  propertyExists, 
  isPropertyOwner, 
  canEditProperty, 
  validatePropertyData, 
  propertyController.updateProperty
);
router.delete('/:id(\\d+)', 
  propertyExists, 
  isPropertyOwner, 
  canDeleteProperty, 
  propertyController.deleteProperty
);

export default router;
