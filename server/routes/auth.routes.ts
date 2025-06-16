import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Routes d'authentification
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Route protégée nécessitant une authentification
router.post('/logout', authenticateJWT, logout);

export default router;
