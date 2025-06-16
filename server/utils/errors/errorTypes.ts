/**
 * Types d'erreurs personnalisées pour l'application
 * Ces types sont utilisés pour catégoriser les erreurs et faciliter leur gestion
 */

export enum ErrorCode {
  // Erreurs de validation (1000-1999)
  VALIDATION_ERROR = 1000,
  INVALID_INPUT = 1001,
  MISSING_REQUIRED_FIELD = 1002,
  INVALID_EMAIL = 1003,
  INVALID_PHONE = 1004,
  INVALID_PASSWORD = 1005,
  PASSWORD_TOO_WEAK = 1006,
  
  // Erreurs d'authentification (2000-2999)
  AUTHENTICATION_FAILED = 2000,
  INVALID_CREDENTIALS = 2001,
  ACCOUNT_LOCKED = 2002,
  TOKEN_EXPIRED = 2003,
  INVALID_TOKEN = 2004,
  ACCESS_DENIED = 2005,
  
  // Erreurs d'autorisation (3000-3999)
  UNAUTHORIZED_ACCESS = 3000,
  INSUFFICIENT_PERMISSIONS = 3001,
  
  // Erreurs de ressource (4000-4999)
  RESOURCE_NOT_FOUND = 4000,
  RESOURCE_ALREADY_EXISTS = 4001,
  RESOURCE_CONFLICT = 4002,
  
  // Erreurs de base de données (5000-5999)
  DATABASE_ERROR = 5000,
  DUPLICATE_ENTRY = 5001,
  CONSTRAINT_VIOLATION = 5002,
  
  // Erreurs de service (6000-6999)
  EXTERNAL_SERVICE_ERROR = 6000,
  SERVICE_UNAVAILABLE = 6001,
  RATE_LIMIT_EXCEEDED = 6002,
  
  // Erreurs système (9000-9999)
  INTERNAL_SERVER_ERROR = 9000,
  NOT_IMPLEMENTED = 9001,
  MAINTENANCE_MODE = 9002
}

export interface IValidationError {
  field: string;
  message: string;
  code: ErrorCode;
  value?: any;
}

export interface IApiError {
  status: number;
  code: ErrorCode;
  message: string;
  errors?: IValidationError[];
  stack?: string;
  timestamp: string;
  path?: string;
  method?: string;
}

export interface IErrorDetails {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
}

// Types d'erreurs communes
export const CommonErrors = {
  // Erreurs de validation
  INVALID_INPUT: {
    code: ErrorCode.INVALID_INPUT,
    message: 'Les données fournies sont invalides',
  },
  
  // Erreurs d'authentification
  INVALID_CREDENTIALS: {
    code: ErrorCode.INVALID_CREDENTIALS,
    message: 'Identifiants invalides',
  },
  
  // Erreurs d'autorisation
  UNAUTHORIZED: {
    code: ErrorCode.UNAUTHORIZED_ACCESS,
    message: 'Non autorisé',
  },
  
  // Erreurs de ressource
  NOT_FOUND: {
    code: ErrorCode.RESOURCE_NOT_FOUND,
    message: 'Ressource non trouvée',
  },
  
  // Erreurs système
  INTERNAL_ERROR: {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Une erreur interne est survenue',
  },
} as const;

// Fonction utilitaire pour créer des erreurs avec des détails
export function createError(
  type: keyof typeof CommonErrors,
  details?: Record<string, any>,
  customMessage?: string
): IErrorDetails {
  const error = CommonErrors[type];
  return {
    code: error.code,
    message: customMessage || error.message,
    ...(details && { details }),
  };
}
