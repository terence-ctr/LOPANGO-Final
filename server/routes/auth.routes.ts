import { Router, Request, Response, NextFunction } from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';
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

// Route protégée nécessitant une authentification
router.post('/logout', authenticateJWT, asyncHandler(logout));

export default router;
