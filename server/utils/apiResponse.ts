import { Response } from 'express';
import { IErrorResponse } from './errors/appError';

/**
 * Interface pour les réponses API réussies
 */
interface ISuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Classe utilitaire pour les réponses API standardisées
 */
export class ApiResponse {
  /**
   * Réponse de succès générique
   */
  static success<T>(
    res: Response,
    data: T,
    statusCode: number = 200
  ): Response<ISuccessResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      data
    });
  }

  /**
   * Réponse de création réussie (201)
   */
  static created<T>(
    res: Response,
    data: T,
    location?: string
  ): Response<ISuccessResponse<T>> {
    if (location) {
      res.setHeader('Location', location);
    }
    return res.status(201).json({
      success: true,
      data
    });
  }

  /**
   * Réponse de succès sans contenu (204)
   */
  static noContent(res: Response): Response<void> {
    return res.status(204).send();
  }

  /**
   * Réponse paginée
   */
  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number
  ): Response<ISuccessResponse<T[]>> {
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    });
  }

  /**
   * Gestion des erreurs
   */
  static error(
    res: Response,
    error: IErrorResponse | Error | unknown,
    defaultMessage: string = 'Une erreur est survenue'
  ): Response<{ success: false; error: IErrorResponse }> {
    // Si c'est déjà une erreur formatée
    if (error && typeof error === 'object' && 'type' in error && 'code' in error) {
      const err = error as IErrorResponse;
      return res.status(err.code || 500).json({
        success: false,
        error: {
          type: err.type || 'INTERNAL_ERROR',
          message: err.message || defaultMessage,
          code: err.code || 500,
          details: 'details' in err ? err.details : undefined,
          stack: process.env.NODE_ENV === 'development' && 'stack' in error ? (error as any).stack : undefined
        }
      });
    }

    // Pour les erreurs standard
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'development' ? error.message : defaultMessage,
          code: 500,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      });
    }

    // Pour les erreurs inconnues
    return res.status(500).json({
      success: false,
      error: {
        type: 'INTERNAL_ERROR',
        message: defaultMessage,
        code: 500
      }
    });
  }

  /**
   * Réponse de validation échouée
   */
  static validationError(
    res: Response,
    errors: Array<{ field: string; message: string }>,
    message: string = 'Erreur de validation'
  ) {
    return res.status(422).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message,
        code: 422,
        details: { errors }
      }
    });
  }

  /**
   * Réponse non autorisée
   */
  static unauthorized(res: Response, message: string = 'Non autorisé') {
    return res.status(401).json({
      success: false,
      error: {
        type: 'UNAUTHORIZED',
        message,
        code: 401
      }
    });
  }

  /**
   * Accès refusé
   */
  static forbidden(res: Response, message: string = 'Accès refusé') {
    return res.status(403).json({
      success: false,
      error: {
        type: 'FORBIDDEN',
        message,
        code: 403
      }
    });
  }

  /**
   * Ressource non trouvée
   */
  static notFound(res: Response, message: string = 'Ressource non trouvée') {
    return res.status(404).json({
      success: false,
      error: {
        type: 'NOT_FOUND',
        message,
        code: 404
      }
    });
  }

  /**
   * Conflit (par exemple, doublon)
   */
  static conflict(res: Response, message: string = 'Conflit de données') {
    return res.status(409).json({
      success: false,
      error: {
        type: 'CONFLICT',
        message,
        code: 409
      }
    });
  }

  /**
   * Trop de requêtes
   */
  static tooManyRequests(res: Response, message: string = 'Trop de requêtes') {
    return res.status(429).json({
      success: false,
      error: {
        type: 'TOO_MANY_REQUESTS',
        message,
        code: 429
      }
    });
  }
}

export default ApiResponse;
