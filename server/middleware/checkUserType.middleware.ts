import { Request, Response, NextFunction } from 'express';
import { UserType } from '../utils/enums/user.enum';
import { AuthException } from '../utils/exceptions/api.exception';
import logger from '../utils/logger';

/**
 * Middleware pour vérifier si l'utilisateur a le type requis
 * @param allowedTypes - Tableau des types d'utilisateurs autorisés
 */
export const checkUserType = (allowedTypes: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        logger.warn('Tentative d\'accès non autorisée - Utilisateur non authentifié', {
          path: req.path,
          method: req.method,
          ip: req.ip,
        });
        throw AuthException.unauthorized('Authentification requise');
      }

      // Vérifier si l'utilisateur a le type requis
      if (!allowedTypes.includes(req.user.userType as UserType)) {
        logger.warn('Tentative d\'accès non autorisée - Type d\'utilisateur incorrect', {
          userId: req.user.id,
          userType: req.user.userType,
          allowedTypes,
          path: req.path,
          method: req.method,
        });
        throw AuthException.forbidden('Droits insuffisants pour accéder à cette ressource');
      }

      // Si tout est bon, passer au middleware suivant
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkUserType;
