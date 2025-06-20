import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database';
import { AppError } from './error.middleware';

// Interface pour l'utilisateur authentifié
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        userType: string;
        firstName: string;
        lastName: string;
      };
    }
  }
}

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 jours

// Vérifier que la clé secrète n'est pas la valeur par défaut en production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key') {
  console.error('ERREUR CRITIQUE: JWT_SECRET doit être défini en production!');
  process.exit(1);
}

// Interface pour le payload du token
interface TokenPayload extends jwt.JwtPayload {
  id: number;
  type: 'access' | 'refresh';
  userType: string;
}

/**
 * Génère un nouveau token d'accès
 */
const generateAccessToken = (userId: number, userType: string) => {
  const expiresIn = ACCESS_TOKEN_EXPIRY;
  const expiresAt = Math.floor(Date.now() / 1000) + (15 * 60); // 15 minutes
  
  const accessToken = jwt.sign(
    { 
      id: userId, 
      type: 'access', 
      userType,
      iat: Math.floor(Date.now() / 1000),
      exp: expiresAt
    },
    JWT_SECRET
  );
  
  return {
    token: accessToken,
    expiresIn,
    expiresAt: new Date(expiresAt * 1000).toISOString()
  };
};

/**
 * Gère le rafraîchissement d'un token expiré
 */
const handleExpiredToken = async (req: Request, res: Response, next: NextFunction, token: string) => {
  const requestId = req.headers['x-request-id'] || 'no-request-id';
  
  try {
    // Vérifier si un refresh token est disponible dans les cookies
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      console.error(`[${new Date().toISOString()}] [${requestId}] [handleExpiredToken] Aucun refresh token disponible`);
      return next(new AppError(401, 'Session expirée. Veuillez vous reconnecter.'));
    }

    // Vérifier le refresh token
    const refreshDecoded = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload;
    
    // Vérifier que c'est bien un refresh token
    if (refreshDecoded.type !== 'refresh') {
      console.error(`[${new Date().toISOString()}] [${requestId}] Type de token invalide`);
      return next(new AppError(401, 'Type de token invalide'));
    }

    // Vérifier que l'utilisateur existe toujours et est actif
    const user = await db('users')
      .where('id', refreshDecoded.id)
      .where('is_active', true)
      .first();

    if (!user) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Utilisateur non trouvé ou inactif`);
      return next(new AppError(401, 'Utilisateur non autorisé ou compte désactivé'));
    }

    // Générer un nouveau token d'accès
    const { token: newAccessToken, expiresAt } = generateAccessToken(user.id, user.user_type);
    
    // Ajouter le nouveau token dans les en-têtes de la réponse
    res.setHeader('X-New-Access-Token', newAccessToken);
    res.setHeader('X-Token-Expires-At', expiresAt);
    
    // Ajouter l'utilisateur à la requête pour les middlewares suivants
    req.user = {
      id: user.id,
      email: user.email,
      userType: user.user_type,
      firstName: user.first_name,
      lastName: user.last_name
    };
    
    console.log(`[${new Date().toISOString()}] [${requestId}] Token rafraîchi pour l'utilisateur: ${user.id}`);
    next();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [${requestId}] Erreur rafraîchissement token:`, error);
    
    // Supprimer les cookies en cas d'erreur
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, 'Votre session a expiré. Veuillez vous reconnecter.'));
    }
    
    next(new AppError(401, 'Session invalide. Veuillez vous reconnecter.'));
  }
};

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || 'no-request-id';
  const logContext = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  };
  
  console.log(`[${new Date().toISOString()}] [${requestId}] [authenticateJWT] Début authentification`, logContext);
  
  // Vérifier si la route est publique
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/refresh-token'];
  if (publicRoutes.some(route => req.originalUrl.startsWith(route))) {
    console.log(`[${new Date().toISOString()}] [${requestId}] [authenticateJWT] Route publique, authentification non requise`);
    return next();
  }
  
  // Récupérer le token depuis le header Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('Aucun en-tête d\'autorisation trouvé');
    return next(new AppError(401, 'Authentification requise'));
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.log('Format de token invalide (devrait commencer par Bearer)');
    return next(new AppError(401, 'Format de token invalide'));
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    console.log('Aucun token trouvé dans l\'en-tête d\'autorisation');
    return next(new AppError(401, 'Token manquant'));
  }
  
  try {
    // Vérifier et décoder le token
    console.log('=== DÉBUT VÉRIFICATION DU TOKEN ===');
    console.log('Token brut reçu:', token.substring(0, 30) + '...');
    console.log('JWT_SECRET défini:', JWT_SECRET ? 'OUI' : 'NON');
    
    // Ajouter une vérification de la structure du token
    const tokenParts = token.split('.');
    console.log('Structure du token:', {
      parts: tokenParts.length,
      header: tokenParts[0] ? 'présent' : 'manquant',
      payload: tokenParts[1] ? 'présent' : 'manquant',
      signature: tokenParts[2] ? 'présent' : 'manquant'
    });
    
    if (tokenParts.length !== 3) {
      console.error('Format de token invalide: nombre de parties incorrect');
      return next(new AppError(401, 'Format de token invalide'));
    }
    
    // Essayer de décoder le payload pour vérification
    let payload: any;
    try {
      payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log('Payload décodé:', payload);
    } catch (e) {
      console.error('Erreur lors du décodage du payload:', e);
      return next(new AppError(401, 'Format de token invalide'));
    }
    
    // Vérifier si le token est expiré
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.log('Token expiré, tentative de rafraîchissement...');
      return handleExpiredToken(req, res, next, token);
    }
    
    // Vérifier le token avec la clé secrète
    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      console.log('Token décodé avec succès:', {
        id: decoded.id,
        type: decoded.type,
        userType: decoded.userType,
        iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'non défini',
        exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'non défini'
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log('Token expiré, tentative de rafraîchissement...');
        return handleExpiredToken(req, res, next, token);
      }
      console.error('Erreur de vérification du token:', error);
      return next(new AppError(401, 'Token invalide'));
    }
    
    // Vérifier que c'est un token d'accès
    if (decoded.type !== 'access') {
      console.log('Tentative d\'utilisation d\'un token invalide comme token d\'accès:', decoded.type);
      return next(new AppError(401, 'Type de token invalide'));
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
        'is_active'
      )
      .first()
      .catch(error => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        throw new AppError(500, 'Erreur lors de la récupération des informations utilisateur');
      });

    if (!user) {
      console.log('Utilisateur non trouvé dans la base de données');
      return next(new AppError(401, 'Utilisateur non autorisé'));
    }

    if (!user) {
      console.log('Utilisateur non trouvé dans la base de données');
      return next(new AppError(401, 'Utilisateur non autorisé'));
    }

    // Vérifier si le compte est actif
    if (user.is_active !== 1) {
      console.log('Compte utilisateur inactif');
      return next(new AppError(403, 'Ce compte a été désactivé'));
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      userType: user.user_type,
      firstName: user.first_name,
      lastName: user.last_name
    };
    
    // Vérifier si le token est sur le point d'expirer (moins de 5 minutes)
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - now;
      
      if (expiresIn < 300) { // 5 minutes
        // Générer un nouveau token
        const { token: newToken, expiresAt } = generateAccessToken(user.id, user.user_type);
        
        // Ajouter le nouveau token dans l'en-tête de la réponse
        res.setHeader('X-New-Token', newToken);
        res.setHeader('X-Token-Expires-At', expiresAt);
      }
    }
    
    console.log('Utilisateur authentifié avec succès:', { 
      userId: user.id, 
      userType: user.user_type 
    });
    
    next();
  } catch (error) {
    console.error('Erreur inattendue lors de l\'authentification:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, 'Votre session a expiré. Veuillez vous reconnecter.'));
    } else if (error instanceof AppError) {
      return next(error);
    }
    
    next(new AppError(500, 'Une erreur est survenue lors de l\'authentification'));
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
