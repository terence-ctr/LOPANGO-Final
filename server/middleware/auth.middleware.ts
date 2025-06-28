import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database';
import { AppError } from './error.middleware';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 jours

// Vérifier que la clé secrète n'est pas la valeur par défaut en production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key') {
  console.error('ERREUR CRITIQUE: JWT_SECRET doit être défini en production!');
  process.exit(1);
}

// Fonction utilitaire pour générer un refresh token
const generateRefreshToken = (userId: number, userType: string) => {
  const expiresIn = 7 * 24 * 60 * 60; // 7 jours en secondes
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  
  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh', userType },
    JWT_SECRET,
    { expiresIn: `${expiresIn}s` }
  );

  return {
    token: refreshToken,
    expiresIn,
    expiresAt
  };
};

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
        email_verified: boolean;
      };
    }
  }
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
    // Vérifier si un refresh token est disponible dans les cookies ou dans le header Authorization
    let refreshToken = req.cookies?.refreshToken;
    
    // Si pas dans les cookies, vérifier dans le header Authorization
    if (!refreshToken && req.headers.authorization) {
      const authParts = req.headers.authorization.split(' ');
      if (authParts.length === 2 && authParts[0] === 'Bearer') {
        refreshToken = authParts[1];
      }
    }
    
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
      .select('id', 'email', 'user_type', 'first_name', 'last_name', 'email_verified')
      .first();

    if (!user) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Utilisateur non trouvé ou inactif`);
      return next(new AppError(401, 'Utilisateur non autorisé ou compte désactivé'));
    }

    // Vérifier si le refresh token est valide dans la base de données
    const validToken = await db('refresh_tokens')
      .where('token', refreshToken)
      .where('revoked', false)
      .where('expires_at', '>', new Date())
      .first();

    if (!validToken) {
      console.error(`[${new Date().toISOString()}] [${requestId}] Refresh token invalide ou expiré`);
      return next(new AppError(401, 'Session expirée. Veuillez vous reconnecter.'));
    }

    // Générer un nouveau token d'accès
    const { token: newAccessToken, expiresAt } = generateAccessToken(user.id, user.user_type);
    
    // Si le refresh token expire bientôt (dans moins d'un jour), en générer un nouveau
    const shouldRefreshToken = new Date(validToken.expires_at).getTime() - Date.now() < 24 * 60 * 60 * 1000;
    let newRefreshToken = null;
    
    if (shouldRefreshToken) {
      // Révocation de l'ancien token
      await db('refresh_tokens')
        .where('id', validToken.id)
        .update({
          revoked: true,
          revoked_at: new Date(),
          updated_at: new Date()
        });
      
      // Générer un nouveau refresh token
      const { token: generatedRefreshToken } = generateRefreshToken(user.id, user.user_type);
      newRefreshToken = generatedRefreshToken;
      
      // Stocker le nouveau refresh token dans la base de données
      await db('refresh_tokens').insert({
        user_id: user.id,
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        created_at: new Date(),
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      // Définir le nouveau refresh token dans les cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'lax' | 'strict' | 'none' | undefined,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.votredomaine.com' : undefined
      };
      
      res.cookie('refreshToken', newRefreshToken, cookieOptions);
    }
    
    // Définir le nouveau token d'accès dans l'en-tête de la réponse
    res.setHeader('Authorization', `Bearer ${newAccessToken}`);
    
    // Si un nouveau refresh token a été généré, l'ajouter à la réponse
    if (newRefreshToken) {
      res.setHeader('X-New-Refresh-Token', newRefreshToken);
    }
    
    // Ajouter les informations utilisateur à la requête pour le prochain middleware
    req.user = {
      id: user.id,
      email: user.email,
      userType: user.user_type,
      firstName: user.first_name,
      lastName: user.last_name,
      email_verified: !!user.email_verified
    };
    
    // Poursuivre avec la requête
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

export const authenticateJWT: RequestHandler = async (req, res, next) => {
  const requestId = req.headers['x-request-id'] || 'no-request-id';
  const logContext = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  };

  console.log(`[${new Date().toISOString()}] [${requestId}] [authenticateJWT] Début authentification`, logContext);

  const publicRoutes = ['/auth/login', '/auth/register', '/auth/refresh-token'];
  if (publicRoutes.some(route => req.originalUrl.startsWith(route))) {
    console.log(`[${new Date().toISOString()}] [${requestId}] [authenticateJWT] Route publique, authentification non requise`);
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Aucun en-tête d\'autorisation valide trouvé');
    return next(new AppError(401, 'Authentification requise'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (decoded.type !== 'access') {
      return next(new AppError(401, 'Type de token invalide pour cette opération'));
    }

    const user = await db('users')
      .where({ id: decoded.id, is_active: true })
      .select('id', 'email', 'first_name', 'last_name', 'user_type', 'is_active', 'email_verified')
      .first();

    if (!user) {
      return next(new AppError(401, 'Utilisateur non trouvé ou compte inactif'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      userType: user.user_type,
      firstName: user.first_name,
      lastName: user.last_name,
      email_verified: !!user.email_verified
    };

    // Refresh near-expiry token
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - now;
      if (expiresIn < 300) { // 5 minutes
        const { token: newToken, expiresAt } = generateAccessToken(user.id, user.user_type);
        res.setHeader('X-New-Token', newToken);
        res.setHeader('X-Token-Expires-At', expiresAt);
      }
    }
    
    console.log('Utilisateur authentifié avec succès:', { userId: user.id, userType: user.user_type });
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log(`[${new Date().toISOString()}] [${requestId}] [authenticateJWT] Token expiré, tentative de rafraîchissement`);
      return handleExpiredToken(req, res, next, token);
    }
    
    console.error(`[${new Date().toISOString()}] [${requestId}] [authenticateJWT] Erreur de vérification du token:`, error);
    return next(new AppError(401, 'Token invalide ou corrompu'));
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
      if (!roles.includes(req.user.userType)) {
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
      if (req.user.userType === 'admin') {
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
