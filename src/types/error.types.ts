/**
 * Classe d'erreur personnalisée pour les erreurs métier
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Capture la stack trace (sauf pour les erreurs opérationnelles)
    if (!isOperational) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Erreurs d'authentification
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non autorisé') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Accès refusé') {
    super(message, 403);
  }
}

// Erreurs de validation
export class ValidationError extends AppError {
  constructor(message: string = 'Erreur de validation', details?: any) {
    super(message, 422, true, details);
  }
}

// Erreurs de ressource non trouvée
export class NotFoundError extends AppError {
  constructor(resource: string = 'Ressource') {
    super(`${resource} non trouvée`, 404);
  }
}

// Erreurs de conflit (ex: doublon)
export class ConflictError extends AppError {
  constructor(message: string = 'Conflit de données') {
    super(message, 409);
  }
}

// Erreurs de service (ex: base de données)
export class ServiceError extends AppError {
  constructor(message: string = 'Erreur du service') {
    super(message, 500, false);
  }
}

// Type pour les erreurs de validation
export interface ValidationErrorItem {
  field: string;
  message: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
  statusCode: number;
}

// Type pour les réponses d'erreur de l'API
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
}
