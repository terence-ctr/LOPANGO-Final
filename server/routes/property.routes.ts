import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateJWT } from '../middleware/auth.middleware';
import * as PropertyController from '../controllers/property.controller';

const router = Router();

// Middleware de validation pour la création et la mise à jour
const validateProperty = [
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('price').isNumeric().withMessage('Le prix doit être un nombre'),
  body('address').notEmpty().withMessage('L\'adresse est requise'),
  body('city').notEmpty().withMessage('La ville est requise'),
  body('postal_code').notEmpty().withMessage('Le code postal est requis'),
  body('country').notEmpty().withMessage('Le pays est requis'),
];

// ======================
// ROUTES PUBLIQUES (sans authentification)
// ======================

// Lister toutes les propriétés
router.get('/', PropertyController.getProperties);

// Voir les détails d'une propriété
router.get('/:id', PropertyController.getPropertyById);

// ======================
// ROUTES PROTÉGÉES (authentification requise)
// ======================

// Créer une nouvelle propriété
router.post(
  '/',
  authenticateJWT,
  validateProperty,
  PropertyController.createProperty
);

// Mettre à jour une propriété existante
router.put(
  '/:id',
  authenticateJWT,
  validateProperty,
  PropertyController.updateProperty
);

// Supprimer une propriété
router.delete(
  '/:id',
  authenticateJWT,
  PropertyController.deleteProperty
);

export const propertyRoutes = router;
