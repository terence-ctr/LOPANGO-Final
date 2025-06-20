/**
 * Types pour la gestion des erreurs côté client
 */

import { AxiosError } from 'axios';

/**
 * Représente une erreur métier standardisée
 */
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;
  stack?: string;
}

/**
 * Représente une erreur de validation
 */
export interface ValidationError extends AppError {
  details: {
    errors: Record<string, string[]>;
  };
}

/**
 * Représente une erreur d'API
 */
export interface ApiError extends AxiosError {
  response?: {
    data?: {
      statusCode: number;
      message: string;
      error?: string;
      errors?: Record<string, string[]>;
      timestamp?: string;
      path?: string;
    };
    status: number;
    statusText: string;
    headers: any;
  };
}

/**
 * Options pour la gestion des erreurs
 */
export interface ErrorHandlingOptions {
  /**
   * Si vrai, affiche une notification à l'utilisateur
   * @default true
   */
  showNotification?: boolean;
  
  /**
   * Si vrai, journalise l'erreur dans la console
   * @default true
   */
  logError?: boolean;
  
  /**
   * Niveau de journalisation ('error', 'warn', 'info', 'debug', 'trace')
   * @default 'error'
   */
  logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  
  /**
   * Redirige vers une route spécifique en cas d'erreur
   */
  redirectTo?: string;
  
  /**
   * Si vrai, déconnecte l'utilisateur en cas d'erreur d'authentification
   * @default true
   */
  logoutOnAuthError?: boolean;
  
  /**
   * Si vrai, tente de rafraîchir le token en cas d'expiration
   * @default true
   */
  refreshTokenOnExpiration?: boolean;
  
  /**
   * Nombre maximal de tentatives de rafraîchissement du token
   * @default 1
   */
  maxTokenRefreshAttempts?: number;
  
  /**
   * Callback appelé avant de rediriger l'utilisateur
   */
  beforeRedirect?: () => void | Promise<void>;
  
  /**
   * Callback appelé après avoir géré l'erreur
   */
  onErrorHandled?: (error: unknown) => void | Promise<void>;
}

/**
 * Configuration pour la gestion des erreurs globales
 */
export interface GlobalErrorHandlingConfig {
  /**
   * Si vrai, active la gestion globale des erreurs non attrapées
   * @default true
   */
  enableUnhandledRejection: boolean;
  
  /**
   * Si vrai, active la gestion globale des erreurs de l'application
   * @default true
   */
  enableError: boolean;
  
  /**
   * Options par défaut pour la gestion des erreurs
   */
  defaultOptions: ErrorHandlingOptions;
  
  /**
   * Fonction pour afficher une notification d'erreur
   */
  showErrorNotification: (message: string, options?: any) => void;
  
  /**
   * Fonction pour rediriger l'utilisateur
   */
  navigateTo: (path: string) => void;
  
  /**
   * Fonction pour déconnecter l'utilisateur
   */
  logout: () => Promise<void>;
  
  /**
   * Fonction pour rafraîchir le token d'authentification
   */
  refreshToken: () => Promise<boolean>;
}

/**
 * Représente une erreur de validation de champ
 */
export interface FieldValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Représente une erreur de validation de formulaire
 */
export interface FormValidationError {
  message: string;
  errors: FieldValidationError[];
  statusCode: number;
}
