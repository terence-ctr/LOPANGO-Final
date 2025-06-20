import { Request, Response, NextFunction } from 'express';
import { AppError, ApiErrorResponse } from '../../types/error.types';
import { logger } from '../../utils/logger';

/**
 * Middleware pour gérer les erreurs de manière centralisée
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log l'erreur pour le débogage
  logger.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);
  
  // Si l'erreur est une instance de notre AppError personnalisée
  if (err instanceof AppError) {
    const response: ApiErrorResponse = {
      statusCode: err.statusCode,
      message: err.message,
      error: err.name,
      timestamp: new Date().toISOString(),
      path: req.path
    };
    
    // Ajouter les détails de validation si disponibles
    if (err.details) {
      response.errors = err.details;
    }
    
    return res.status(err.statusCode).json(response);
  }
  
  // Gestion des erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      statusCode: 401,
      message: 'Token JWT invalide',
      error: 'Unauthorized',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      statusCode: 401,
      message: 'Session expirée. Veuillez vous reconnecter.',
      error: 'Token Expired',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  
  // Erreur de validation de schéma (comme avec Joi ou class-validator)
  if (err.name === 'ValidationError') {
    const validationError = err as any;
    const errors: Record<string, string[]> = {};
    
    if (validationError.details) {
      // Format pour Joi
      validationError.details.forEach((detail: any) => {
        const key = detail.path.join('.');
        if (!errors[key]) {
          errors[key] = [];
        }
        errors[key].push(detail.message);
      });
    } else if (validationError.errors) {
      // Format pour class-validator
      Object.keys(validationError.errors).forEach(key => {
        errors[key] = [validationError.errors[key].message];
      });
    }
    
    return res.status(422).json({
      statusCode: 422,
      message: 'Erreur de validation',
      error: 'Validation Error',
      errors,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  
  // Erreur de base de données
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    // Gestion spécifique des erreurs MongoDB
    const mongoError = err as any;
    
    // Erreur de clé en double
    if (mongoError.code === 11000) {
      const field = Object.keys(mongoError.keyPattern)[0];
      return res.status(409).json({
        statusCode: 409,
        message: `La valeur du champ '${field}' existe déjà`,
        error: 'Duplicate Key Error',
        timestamp: new Date().toISOString(),
        path: req.path,
        field
      });
    }
  }
  
  // Pour toutes les autres erreurs non gérées
  console.error('Erreur non gérée:', err);
  
  // En production, ne pas envoyer les détails de l'erreur
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    statusCode: 500,
    message: isProduction ? 'Une erreur est survenue sur le serveur' : err.message,
    error: isProduction ? 'Internal Server Error' : err.name,
    ...(!isProduction && { stack: err.stack }),
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

/**
 * Middleware pour gérer les routes non trouvées
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    statusCode: 404,
    message: `Impossible de trouver ${req.originalUrl} sur ce serveur`,
    error: 'Not Found',
    timestamp: new Date().toISOString(),
    path: req.path
  });
};
