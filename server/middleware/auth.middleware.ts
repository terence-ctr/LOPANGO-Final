import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database';
import { AppError } from './error.middleware';

// Interface pour l'utilisateur authentifié
declare global {
  namespace Express {
    interface Request {
      user?: any; // Vous pouvez remplacer 'any' par une interface plus spécifique
    }
  }
}

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware pour vérifier le token JWT
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Token d\'authentification manquant ou invalide');
    }

    const token = authHeader.split(' ')[1];
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; type: string };
    
    // Vérifier que ce n'est pas un refresh token
    if (decoded.type === 'refresh') {
      throw new AppError(401, 'Type de token invalide');
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await db('users')
      .where('id', decoded.id)
      .select(
        'id',
        'email',
        'first_name',
        'last_name',
        'user_type',
        'email_verified',
        'is_active'
      )
      .first();

    if (!user) {
      throw new AppError(404, 'Utilisateur non trouvé');
    }

    // Vérifier que le compte est actif
    if (!user.is_active) {
      throw new AppError(403, 'Ce compte est désactivé');
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Token invalide'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Token expiré'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware pour vérifier les rôles des utilisateurs
 * @param roles - Tableau des rôles autorisés
 */
export const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Non authentifié');
      }

      // Si aucun rôle n'est spécifié, l'accès est autorisé
      if (roles.length === 0) {
        return next();
      }

      // Vérifier si l'utilisateur a l'un des rôles requis
      if (!roles.includes(req.user.user_type)) {
        throw new AppError(403, 'Droits insuffisants pour accéder à cette ressource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware pour vérifier que l'utilisateur est le propriétaire de la ressource
 * @param resourceUserId - ID de l'utilisateur propriétaire de la ressource
 */
export const isOwner = (resourceUserId: number | string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Non authentifié');
      }

      // Si l'utilisateur est admin, il a automatiquement accès
      if (req.user.user_type === 'admin') {
        return next();
      }

      // Vérifier que l'utilisateur est bien le propriétaire de la ressource
      if (req.user.id !== Number(resourceUserId)) {
        throw new AppError(403, 'Vous n\'êtes pas autorisé à accéder à cette ressource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware pour vérifier que l'utilisateur a vérifié son email
 */
export const checkEmailVerified = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Non authentifié');
    }

    // Si l'email n'est pas vérifié
    if (!req.user.email_verified) {
      throw new AppError(403, 'Veuillez vérifier votre adresse email pour continuer');
    }

    next();
  } catch (error) {
    next(error);
  }
};
