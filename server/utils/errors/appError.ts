import { Response } from 'express';

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL = 'INTERNAL',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

export interface IErrorResponse {
  type: ErrorType;
  message: string;
  code: number;
  details?: any;
  stack?: string;
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code: number;
  public readonly details: any;
  public readonly isOperational: boolean;

  constructor(
    type: ErrorType,
    message: string,
    code: number,
    details?: any,
    isOperational = true
  ) {
    super(message);
    this.type = type;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    
    // Pour la stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON(): IErrorResponse {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      details: this.details,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }

  // Méthodes statiques pour créer des erreurs courantes
  static badRequest(message: string, details?: any): AppError {
    return new AppError(ErrorType.BAD_REQUEST, message, 400, details);
  }

  static unauthorized(message = 'Non autorisé'): AppError {
    return new AppError(ErrorType.UNAUTHORIZED, message, 401);
  }

  static forbidden(message = 'Accès refusé'): AppError {
    return new AppError(ErrorType.FORBIDDEN, message, 403);
  }

  static notFound(resource = 'Ressource'): AppError {
    return new AppError(ErrorType.NOT_FOUND, `${resource} non trouvé(e)`, 404);
  }

  static conflict(message: string, details?: any): AppError {
    return new AppError(ErrorType.CONFLICT, message, 409, details);
  }

  static validationError(message: string, details?: any): AppError {
    return new AppError(ErrorType.VALIDATION, message, 422, details);
  }

  static internalError(message = 'Erreur interne du serveur', error?: Error): AppError {
    return new AppError(
      ErrorType.INTERNAL,
      message,
      500,
      process.env.NODE_ENV === 'development' && error ? error.message : undefined
    );
  }
}

export const handleError = (err: any, res: Response): void => {
  // Si c'est une de nos erreurs personnalisées
  if (err instanceof AppError) {
    res.status(err.code).json(err.toJSON());
    return;
  }

  // Pour les erreurs de validation Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e: any) => ({
      field: e.path,
      message: e.message
    }));
    
    const error = AppError.validationError('Erreur de validation', { errors });
    res.status(error.code).json(error.toJSON());
    return;
  }

  // Pour les autres erreurs non gérées
  console.error('Erreur non gérée:', err);
  const error = AppError.internalError('Une erreur inattendue est survenue');
  res.status(error.code).json(error.toJSON());
};
