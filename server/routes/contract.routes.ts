import { Router } from 'express';
import { authenticateJWT as authenticate } from '../middleware/auth.middleware';
import * as contractController from '../controllers/contract.controller';

const router = Router();

router.use(authenticate);

router.post('/', contractController.createContract);

export default router;
