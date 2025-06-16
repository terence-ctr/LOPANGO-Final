import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { isHttpException } from '../utils/exceptions/api.exception';

/**
 * Gestionnaire d'erreurs pour les routes non trouvées (404)
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  logger.warn(`Route non trouvée: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    message: `La ressource demandée n'existe pas: ${req.originalUrl}`,
  });
};

/**
 * Gestionnaire d'erreurs global
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Vérifier si l'erreur est une HttpException personnalisée
  if (isHttpException(err)) {
    const status = err.status || 500;
    const message = err.message || 'Une erreur est survenue';
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    
    // Journalisation de l'erreur
    logger.error(`Erreur HTTP [${status}]: ${message}`, {
      code,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Réponse à l'utilisateur
    return res.status(status).json({
      success: false,
      error: message,
      code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Gestion des erreurs de validation (Joi, express-validator, etc.) 
  if (err.name === 'ValidationError' || err.name === 'SequelizeValidationError') {
    const messages = (err as any).errors
      ? (err as any).errors.map((e: any) => e.message)
      : [err.message];
    
    logger.warn(`Erreur de validation: ${messages.join(', ')}`, {
      name: err.name,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    return res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      messages,
      code: 'VALIDATION_ERROR',
    });
  }

  // Gestion des erreurs JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    logger.warn(`Erreur d'authentification: ${err.message}`, {
      name: err.name,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    return res.status(401).json({
      success: false,
      error: 'Token invalide ou expiré',
      code: 'INVALID_TOKEN',
    });
  }

  // Gestion des erreurs de base de données
  if (err.name === 'SequelizeDatabaseError' || err.name === 'SequelizeConnectionError') {
    logger.error(`Erreur de base de données: ${err.message}`, {
      name: err.name,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    return res.status(503).json({
      success: false,
      error: 'Service temporairement indisponible',
      code: 'SERVICE_UNAVAILABLE',
      ...(process.env.NODE_ENV === 'development' && { message: err.message }),
    });
  }

  // Pour toutes les autres erreurs non gérées
  logger.error(`Erreur inattendue: ${err.message}`, {
    name: err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    body: req.body,
  });

  // Réponse générique en production, détaillée en développement
  const response: any = {
    success: false,
    error: 'Une erreur inattendue est survenue',
    code: 'INTERNAL_SERVER_ERROR',
  };

  if (process.env.NODE_ENV === 'development') {
    response.message = err.message;
    response.stack = err.stack;
  }

  res.status(500).json(response);
};

/**
 * Gestion des erreurs pour les promesses non gérées
 */
export const unhandledRejectionHandler = (reason: Error, promise: Promise<any>) => {
  logger.error('Rejet de promesse non géré:', {
    message: reason.message,
    stack: reason.stack,
    promise,
  });
  
  // Dans un environnement de production, vous pourriez vouloir notifier un service externe
  // comme Sentry, Rollbar, etc.
};

/**
 * Gestion des exceptions non gérées
 */
export const uncaughtExceptionHandler = (error: Error) => {
  logger.error('Exception non gérée:', {
    message: error.message,
    stack: error.stack,
  });
  
  // Dans un environnement de production, vous pourriez vouloir notifier un service externe
  // puis arrêter le processus si nécessaire
  if (process.env.NODE_ENV === 'production') {
    // Donner le temps d'écrire les logs avant de s'arrêter
    setTimeout(() => process.exit(1), 1000);
  }
};

export default {
  errorHandler,
  notFoundHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
};
