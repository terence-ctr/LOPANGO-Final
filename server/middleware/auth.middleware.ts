import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import config from '../config/config';
import { SanitizedUser } from '../utils/interfaces/user.interface';
import { AuthException } from '../utils/exceptions/api.exception';
import logger from '../utils/logger';
import { isValidIdFormat, getUserTypeFromId } from '../utils/idGenerator';

// Déclaration de l'interface étendue pour la requête authentifiée
declare global {
  namespace Express {
    interface Request {
      user?: SanitizedUser & {
        userId: string;
      };
    }
  }
}

// Alias pour la requête authentifiée
type AuthenticatedRequest = Request & {
  user: SanitizedUser & {
    userId: string;
  };
};

// Vérifie si l'utilisateur est authentifié
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AuthException.unauthorized('Aucun token fourni');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, config.jwt.secret, {
        audience: 'lopango-app',
        issuer: 'lopango-api',
      }) as { 
        userId: string; 
        email: string; 
        userType: string;
        iat?: number;
        exp?: number;
      };

      // Vérifier le format de l'ID
      if (!isValidIdFormat(decoded.userId)) {
        logger.warn('Format d\'ID utilisateur invalide dans le token JWT', { userId: decoded.userId });
        throw AuthException.unauthorized('Token invalide');
      }

      // Vérifier que le type d'utilisateur dans le token correspond au préfixe de l'ID
      const idUserType = getUserTypeFromId(decoded.userId);
      if (idUserType !== decoded.userType) {
        logger.warn('Incohérence entre le type d\'utilisateur et l\'ID', { 
          userId: decoded.userId, 
          tokenUserType: decoded.userType,
          idUserType 
        });
        throw AuthException.unauthorized('Token invalide');
      }
      
      // Vérifier si l'utilisateur existe toujours et est actif
      const user = await User.findByPk(decoded.userId, {
        attributes: { 
          exclude: ['password', 'refreshToken', 'resetPasswordToken', 'resetPasswordExpire'] 
        },
      });

      if (!user) {
        logger.warn('Utilisateur non trouvé lors de l\'authentification', { userId: decoded.userId });
        throw AuthException.unauthorized('Session expirée ou invalide');
      }

      if (user.status !== 'active') {
        logger.warn('Tentative de connexion avec un compte inactif', { 
          userId: user.id, 
          status: user.status 
        });
        
        let message = 'Votre compte est désactivé';
        if (user.status === 'pending_verification') {
          message = 'Veuvez vérifier votre adresse email pour activer votre compte';
        } else if (user.status === 'suspended') {
          message = 'Votre compte a été suspendu. Contactez le support pour plus d\'informations.';
        }
        
        throw AuthException.forbidden(message);
      }

      // Ajouter l'utilisateur à la requête
      req.user = {
        ...user.toJSON() as SanitizedUser,
        userId: user.id,
      };
      
      // Ajouter des informations de débogage
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Utilisateur authentifié avec succès', { 
          userId: user.id,
          userType: user.userType,
          email: user.email 
        });
      }

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(AuthException.tokenExpired());
      } else if (error instanceof AuthException) {
        return next(error);
      }
      return next(AuthException.invalidToken());
    }
  } catch (error) {
    next(error);
  }
};

// Vérifie si l'utilisateur a le rôle requis
const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        logger.warn('Tentative d\'accès non autorisée - Utilisateur non authentifié');
        throw AuthException.unauthorized('Authentification requise');
      }
      
      if (!roles.includes(req.user.userType)) {
        logger.warn('Tentative d\'accès non autorisée - Rôle insuffisant', { 
          userId: req.user.id, 
          requiredRoles: roles,
          userRole: req.user.userType 
        });
        throw AuthException.forbidden('Droits insuffisants pour accéder à cette ressource');
      }
      
      logger.debug('Accès autorisé', { 
        userId: req.user.id, 
        requiredRoles: roles,
        userRole: req.user.userType 
      });
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware pour gérer les erreurs d'authentification et d'autorisation
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AuthException) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(err.details && { details: err.details })
    });
  }
  
  // Gestion des erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Token invalide'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      code: 'TOKEN_EXPIRED',
      message: 'Session expirée, veuillez vous reconnecter'
    });
  }
  
  // Pour les autres erreurs non gérées
  console.error('Erreur non gérée:', err);
  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Une erreur est survenue lors de l\'authentification'
  });
};

export { 
  authenticate, 
  authorize, 
  errorHandler,
  AuthenticatedRequest 
};
