/**
 * Fichier d'exportation centralisé pour les utilitaires de gestion d'erreurs
 */

export { default as ErrorHandler } from './errorHandler';
export * from './errorConfig';
export * from '@/types/error.types';

// Types d'erreurs couramment utilisés
export { default as AppError } from '@/types/error.types';
export { default as ValidationError } from '@/types/error.types';
export { default as UnauthorizedError } from '@/types/error.types';
export { default as ForbiddenError } from '@/types/error.types';
export { default as NotFoundError } from '@/types/error.types';
export { default as ConflictError } from '@/types/error.types';

// Configuration par défaut
export * from './errorConfig';

// Types
export * from './types';

// Fonction utilitaire pour créer des erreurs personnalisées
export function createError(
  message: string,
  statusCode: number = 500,
  details?: any
) {
  return new AppError(message, statusCode, true, details);
}

// Fonction utilitaire pour créer une erreur de validation
export function createValidationError(errors: Record<string, string[]>) {
  return new AppError('Erreur de validation', 422, true, { errors });
}
