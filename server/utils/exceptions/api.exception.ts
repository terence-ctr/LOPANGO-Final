import { HttpStatus } from '@nestjs/common';

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: Record<string, any>) {
    return new ApiException(HttpStatus.BAD_REQUEST, message, code, details);
  }

  static unauthorized(message = 'Non autorisé', code = 'UNAUTHORIZED') {
    return new ApiException(HttpStatus.UNAUTHORIZED, message, code);
  }

  static forbidden(message = 'Accès refusé', code = 'FORBIDDEN') {
    return new ApiException(HttpStatus.FORBIDDEN, message, code);
  }

  static notFound(message = 'Ressource non trouvée', code = 'NOT_FOUND') {
    return new ApiException(HttpStatus.NOT_FOUND, message, code);
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new ApiException(HttpStatus.CONFLICT, message, code);
  }

  static internalError(message = 'Une erreur interne est survenue', code = 'INTERNAL_SERVER_ERROR') {
    return new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, message, code);
  }

  static fromError(error: Error) {
    if (error instanceof ApiException) {
      return error;
    }
    return new ApiException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Une erreur inattendue est survenue',
      'INTERNAL_SERVER_ERROR',
    );
  }
}

// Exceptions spécifiques à l'authentification
export class AuthException extends ApiException {
  constructor(message: string, code = 'AUTH_ERROR') {
    super(HttpStatus.UNAUTHORIZED, message, code);
  }

  static invalidCredentials() {
    return new AuthException('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
  }

  static accountNotActive() {
    return new AuthException(
      'Votre compte n\'est pas actif. Veuillez vérifier votre email ou contacter le support',
      'ACCOUNT_NOT_ACTIVE',
    );
  }

  static invalidToken() {
    return new AuthException('Token invalide ou expiré', 'INVALID_TOKEN');
  }

  static tokenExpired() {
    return new AuthException('La session a expiré, veuillez vous reconnecter', 'TOKEN_EXPIRED');
  }

  static insufficientPermissions() {
    return new AuthException('Permissions insuffisantes pour effectuer cette action', 'INSUFFICIENT_PERMISSIONS');
  }
}

// Exceptions pour la validation
export class ValidationException extends ApiException {
  constructor(message: string, details?: Record<string, any>) {
    super(HttpStatus.BAD_REQUEST, message, 'VALIDATION_ERROR', details);
  }

  static fromValidationErrors(errors: Record<string, string[]>) {
    return new ValidationException('Erreur de validation des données', errors);
  }
}

// Type guard pour vérifier si une erreur est une HttpException
export const isHttpException = (error: any): error is ApiException => {
  return error && 
         typeof error === 'object' && 
         'statusCode' in error && 
         'message' in error &&
         error instanceof Error;
};
