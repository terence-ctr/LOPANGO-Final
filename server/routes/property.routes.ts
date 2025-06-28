import { Router } from 'express';
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
