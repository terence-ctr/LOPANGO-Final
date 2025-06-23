import { Router } from 'express';
import { PropertyMetadataController } from '../controllers/propertyMetadata.controller';

const router = Router();

// Routes pour les types de propriétés
router.get('/types', PropertyMetadataController.getPropertyTypes);
router.get('/types/:value', PropertyMetadataController.getPropertyTypeByValue);
router.get('/types/:value/exists', PropertyMetadataController.checkPropertyTypeExists);

// Routes pour les statuts de propriétés
router.get('/statuses', PropertyMetadataController.getPropertyStatuses);
router.get('/statuses/:value', PropertyMetadataController.getPropertyStatusByValue);
router.get('/statuses/:value/exists', PropertyMetadataController.checkPropertyStatusExists);

// Routes pour les équipements
router.get('/equipments', PropertyMetadataController.getPropertyEquipments);
router.get('/equipments/:value', PropertyMetadataController.getPropertyEquipmentByValue);
router.get('/equipments/:value/exists', PropertyMetadataController.checkPropertyEquipmentExists);

// Routes pour les devises
router.get('/currencies', PropertyMetadataController.getCurrencies);
router.get('/currencies/:code/exists', PropertyMetadataController.checkCurrencyExists);

export default router;
