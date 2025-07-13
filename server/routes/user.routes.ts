import { Router } from 'express';
import { authenticateJWT as authenticate } from '../middleware/auth.middleware';
import { getUsers } from '../controllers/user.controller';

const router = Router();

// Route pour récupérer tous les utilisateurs (avec filtre optionnel)
router.get('/', authenticate, getUsers);

// Route spécifique pour récupérer uniquement les agents
router.get('/agents', authenticate, (req, res, next) => {
  // Ajouter le filtre user_type=agent à la requête
  req.query.user_type = 'agent';
  next();
}, getUsers);

export default router;
