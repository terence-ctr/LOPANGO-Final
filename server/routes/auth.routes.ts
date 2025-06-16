import { Router, Request, Response, NextFunction } from 'express';
import { register, login, refreshToken, logout, getCurrentUser } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Wrapper pour gérer les erreurs des contrôleurs asynchrones
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Routes d'authentification
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh-token', asyncHandler(refreshToken));

// Routes protégées nécessitant une authentification
console.log('Enregistrement de la route GET /auth/me');
router.get('/me', authenticateJWT, asyncHandler((req, res) => {
  console.log('Requête reçue sur /auth/me');
  return getCurrentUser(req, res);
}));

console.log('Enregistrement de la route POST /auth/logout');
router.post('/logout', authenticateJWT, asyncHandler(logout));

export default router;
