import { Router } from 'express';
import { PropertyMetadataController } from '../controllers/propertyMetadata.controller';

const router = Router();

// Wrapper pour gérer les erreurs async
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Route pour récupérer toutes les métadonnées en une seule fois
router.get('/', asyncHandler(PropertyMetadataController.getAllMetadata));


// Routes pour les types de propriétés
router.get('/types', asyncHandler(PropertyMetadataController.getPropertyTypes));
router.get('/types/:value', asyncHandler(PropertyMetadataController.getPropertyTypeByValue));
router.get('/types/:value/exists', asyncHandler(PropertyMetadataController.checkPropertyTypeExists));

// Routes pour les statuts de propriétés
router.get('/statuses', asyncHandler(PropertyMetadataController.getPropertyStatuses));
router.get('/statuses/:value', asyncHandler(PropertyMetadataController.getPropertyStatusByValue));
router.get('/statuses/:value/exists', asyncHandler(PropertyMetadataController.checkPropertyStatusExists));

// Routes pour les équipements
router.get('/equipments', asyncHandler(PropertyMetadataController.getPropertyEquipments));
router.get('/equipments/:value', asyncHandler(PropertyMetadataController.getPropertyEquipmentByValue));
router.get('/equipments/:value/exists', asyncHandler(PropertyMetadataController.checkPropertyEquipmentExists));

// Routes pour les devises
router.get('/currencies', asyncHandler(PropertyMetadataController.getCurrencies));
router.get('/currencies/:code/exists', asyncHandler(PropertyMetadataController.checkCurrencyExists));

export default router;
