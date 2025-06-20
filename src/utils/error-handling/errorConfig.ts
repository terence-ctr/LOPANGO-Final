/**
 * Configuration pour la gestion des erreurs côté client
 */

export const ERROR_MESSAGES = {
  // Erreurs réseau
  NETWORK_ERROR: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.',
  TIMEOUT: 'La requête a pris trop de temps. Veuillez réessayer.',
  
  // Erreurs d'authentification
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette ressource.',
  FORBIDDEN: 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.',
  TOKEN_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  TOKEN_INVALID: 'Le token fourni est invalide.',
  TOKEN_MISSING: 'Aucun token fourni. Veuillez vous connecter.',
  TOKEN_REFRESH_FAILED: 'Échec du rafraîchissement du token. Veuillez vous reconnecter.',
  INVALID_CREDENTIALS: 'Identifiants incorrects. Veuillez réessayer.',
  ACCOUNT_NOT_VERIFIED: 'Votre compte n\'est pas encore vérifié. Veuillez vérifier votre email.',
  ACCOUNT_DISABLED: 'Votre compte a été désactivé. Veuillez contacter le support.',
  TOO_MANY_ATTEMPTS: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  INVALID_REFRESH_TOKEN: 'Le refresh token est invalide ou expiré.',
  REFRESH_TOKEN_REQUIRED: 'Un refresh token est requis pour rafraîchir la session.',
  
  // Erreurs de validation
  VALIDATION_ERROR: 'Des erreurs de validation sont survenues.',
  REQUIRED_FIELD: 'Ce champ est obligatoire.',
  INVALID_EMAIL: 'Veuillez saisir une adresse email valide.',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères.',
  PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas.',
  INVALID_PHONE: 'Numéro de téléphone invalide.',
  INVALID_DATE: 'Date invalide.',
  INVALID_GENDER: 'Genre invalide.',
  INVALID_USER_TYPE: 'Type d\'utilisateur invalide.',
  
  // Erreurs de ressources
  NOT_FOUND: 'La ressource demandée est introuvable.',
  RESOURCE_EXISTS: 'Cette ressource existe déjà.',
  USER_NOT_FOUND: 'Aucun utilisateur trouvé avec ces identifiants.',
  PROPERTY_NOT_FOUND: 'Aucune propriété trouvée.',
  
  // Erreurs serveur
  INTERNAL_SERVER_ERROR: 'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.',
  MAINTENANCE: 'Le service est actuellement en maintenance. Veuillez réessayer ultérieurement.',
  DATABASE_ERROR: 'Une erreur de base de données est survenue.',
  
  // Erreurs de formulaire
  FORM_INVALID: 'Veuillez corriger les erreurs dans le formulaire.',
  FILE_TOO_LARGE: 'Le fichier est trop volumineux. La taille maximale est de 5 Mo.',
  INVALID_FILE_TYPE: 'Type de fichier non pris en charge.',
  
  // Erreurs de paiement
  PAYMENT_FAILED: 'Le paiement a échoué. Veuillez réessayer ou contacter le support.',
  PAYMENT_DECLINED: 'Paiement refusé. Veuillez vérifier vos informations de paiement.',
  INSUFFICIENT_FUNDS: 'Fonds insuffisants pour effectuer cette opération.',
  
  // Messages d'erreur par défaut
  DEFAULT: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
};

/**
 * Codes d'erreur personnalisés
 */
export const ERROR_CODES = {
  // Erreurs réseau (1xx)
  NETWORK_ERROR: 100,
  TIMEOUT: 101,
  
  // Erreurs d'authentification (2xx)
  UNAUTHORIZED: 200,
  FORBIDDEN: 201,
  TOKEN_EXPIRED: 202,
  TOKEN_INVALID: 203,
  TOKEN_MISSING: 204,
  TOKEN_REFRESH_FAILED: 205,
  INVALID_CREDENTIALS: 206,
  ACCOUNT_NOT_VERIFIED: 207,
  ACCOUNT_DISABLED: 208,
  TOO_MANY_ATTEMPTS: 209,
  SESSION_EXPIRED: 210,
  INVALID_REFRESH_TOKEN: 211,
  REFRESH_TOKEN_REQUIRED: 212,
  INVALID_AUTH_HEADER: 213,
  
  // Erreurs de validation (3xx)
  VALIDATION_ERROR: 300,
  REQUIRED_FIELD: 301,
  INVALID_EMAIL: 302,
  PASSWORD_TOO_SHORT: 303,
  PASSWORD_MISMATCH: 304,
  INVALID_PHONE: 305,
  INVALID_DATE: 306,
  INVALID_GENDER: 307,
  INVALID_USER_TYPE: 308,
  INVALID_INPUT: 309,
  
  // Erreurs de ressources (4xx)
  NOT_FOUND: 400,
  RESOURCE_EXISTS: 401,
  USER_NOT_FOUND: 402,
  PROPERTY_NOT_FOUND: 403,
  
  // Erreurs serveur (5xx)
  INTERNAL_SERVER_ERROR: 500,
  MAINTENANCE: 501,
  DATABASE_ERROR: 502,
  EXTERNAL_SERVICE_ERROR: 503,
  
  // Erreurs de formulaire (6xx)
  FORM_INVALID: 600,
  FILE_TOO_LARGE: 601,
  INVALID_FILE_TYPE: 602,
  
  // Erreurs de paiement (7xx)
  PAYMENT_FAILED: 700,
  PAYMENT_DECLINED: 701,
  INSUFFICIENT_FUNDS: 702,
  
  // Erreurs de taux limite (8xx)
  RATE_LIMIT_EXCEEDED: 800,
  TOO_MANY_REQUESTS: 801,
  
  // Erreurs de version (9xx)
  DEPRECATED_API: 900,
  VERSION_MISMATCH: 901,
  
  // Erreurs de configuration (1000+)
  MISSING_CONFIGURATION: 1000,
  INVALID_CONFIGURATION: 1001
};

/**
 * Configuration pour la gestion des erreurs
 */
/**
 * Configuration des erreurs avec gestion avancée
 */
export const ERROR_CONFIG = {
  // Durée d'affichage des notifications d'erreur (en millisecondes)
  NOTIFICATION_DURATION: 5000,
  
  // Nombre maximal de tentatives pour les requêtes échouées
  MAX_RETRIES: 3,
  
  // Délai entre les tentatives (en millisecondes)
  RETRY_DELAY: 1000,
  
  // Activer/désactiver la journalisation des erreurs
  LOGGING: {
    ENABLED: true,
    LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    MAX_STACK_TRACES: process.env.NODE_ENV === 'production' ? 1 : 5,
    LOG_TO_CONSOLE: true,
    LOG_TO_FILE: process.env.NODE_ENV === 'production',
    LOG_FILE: 'logs/error.log',
    MAX_FILE_SIZE: '20m',
    MAX_FILES: '14d'
  },
  
  // Configuration pour les erreurs spécifiques
  ERRORS: {
    // Erreurs réseau
    [ERROR_CODES.NETWORK_ERROR]: {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      showToast: true,
      logLevel: 'error',
      retryable: true,
      autoRetry: true,
      maxRetries: 3,
      retryDelay: 2000
    },
    
    // Erreurs de temps d'attente
    [ERROR_CODES.TIMEOUT]: {
      message: ERROR_MESSAGES.TIMEOUT,
      showToast: true,
      logLevel: 'warn',
      retryable: true,
      autoRetry: true
    },
    
    // Erreurs d'authentification
    [ERROR_CODES.UNAUTHORIZED]: {
      message: ERROR_MESSAGES.UNAUTHORIZED,
      showToast: true,
      logLevel: 'warn',
      redirectTo: '/login',
      clearAuth: true,
      statusCode: 401
    },
    
    // Token expiré
    [ERROR_CODES.TOKEN_EXPIRED]: {
      message: ERROR_MESSAGES.TOKEN_EXPIRED,
      showToast: true,
      logLevel: 'warn',
      redirectTo: '/login',
      clearAuth: true,
      statusCode: 401,
      autoRefresh: true
    },
    
    // Token invalide
    [ERROR_CODES.TOKEN_INVALID]: {
      message: ERROR_MESSAGES.TOKEN_INVALID,
      showToast: true,
      logLevel: 'warn',
      redirectTo: '/login',
      clearAuth: true,
      statusCode: 401
    },
    
    // Token manquant
    [ERROR_CODES.TOKEN_MISSING]: {
      message: ERROR_MESSAGES.TOKEN_MISSING,
      showToast: true,
      logLevel: 'warn',
      redirectTo: '/login',
      clearAuth: true,
      statusCode: 401
    },
    
    // Échec du rafraîchissement du token
    [ERROR_CODES.TOKEN_REFRESH_FAILED]: {
      message: ERROR_MESSAGES.TOKEN_REFRESH_FAILED,
      showToast: true,
      logLevel: 'error',
      redirectTo: '/login',
      clearAuth: true,
      statusCode: 401
    },
    
    // Identifiants invalides
    [ERROR_CODES.INVALID_CREDENTIALS]: {
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      showToast: true,
      logLevel: 'warn',
      statusCode: 401
    },
    
    // Compte non vérifié
    [ERROR_CODES.ACCOUNT_NOT_VERIFIED]: {
      message: ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
      showToast: true,
      logLevel: 'warn',
      statusCode: 403,
      redirectTo: '/verify-email',
      showResendButton: true
    },
    
    // Trop de tentatives
    [ERROR_CODES.TOO_MANY_ATTEMPTS]: {
      message: ERROR_MESSAGES.TOO_MANY_ATTEMPTS,
      showToast: true,
      logLevel: 'warn',
      statusCode: 429,
      retryAfter: 300, // 5 minutes
      showRetryAfter: true
    },
    
    // Erreurs de validation
    [ERROR_CODES.VALIDATION_ERROR]: {
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      showToast: true,
      logLevel: 'info',
      statusCode: 422,
      showFieldErrors: true,
      highlightFields: true
    },
    
    // Ressource non trouvée
    [ERROR_CODES.NOT_FOUND]: {
      message: ERROR_MESSAGES.NOT_FOUND,
      showToast: true,
      logLevel: 'warn',
      statusCode: 404
    },
    
    // Erreur serveur
    [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      showToast: true,
      logLevel: 'error',
      statusCode: 500,
      showSupport: true,
      reportToAdmin: true
    },
    
    // Maintenance
    [ERROR_CODES.MAINTENANCE]: {
      message: ERROR_MESSAGES.MAINTENANCE,
      showToast: true,
      logLevel: 'info',
      statusCode: 503,
      redirectTo: '/maintenance',
      showCountdown: true
    }
  },
  
  // Configuration pour la gestion des tokens
  TOKEN: {
    // En-tête d'autorisation
    HEADER: 'Authorization',
    PREFIX: 'Bearer ',
    
    // Paramètres de rafraîchissement
    REFRESH_ENDPOINT: '/api/auth/refresh-token',
    REFRESH_METHOD: 'POST',
    
    // Stratégie de rafraîchissement
    REFRESH_STRATEGY: 'auto', // 'auto', 'manual', 'none'
    MAX_REFRESH_ATTEMPTS: 3,
    REFRESH_RETRY_DELAY: 1000,
    
    // Paramètres de stockage
    STORAGE_KEY: 'lopango_auth_token',
    REFRESH_TOKEN_KEY: 'lopango_refresh_token',
    USER_DATA_KEY: 'lopango_user_data',
    
    // Paramètres de sécurité
    SECURE_COOKIE: process.env.NODE_ENV === 'production',
    HTTP_ONLY: true,
    SAME_SITE: 'Strict',
    
    // Paramètres de débogage
    DEBUG: process.env.NODE_ENV !== 'production'
  },
  
  // Configuration pour les requêtes API
  API: {
    BASE_URL: process.env.VUE_APP_API_BASE_URL || '/api',
    TIMEOUT: 30000, // 30 secondes
    WITH_CREDENTIALS: true,
    
    // En-têtes par défaut
    HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    
    // Configuration des intercepteurs
    INTERCEPTORS: {
      REQUEST: {
        ENABLED: true,
        AUTH: true,
        LOGGING: process.env.NODE_ENV !== 'production',
        ON_ERROR: 'reject' // 'reject' ou 'continue'
      },
      RESPONSE: {
        ENABLED: true,
        AUTH: true,
        LOGGING: process.env.NODE_ENV !== 'production',
        ON_ERROR: 'reject' // 'reject' ou 'continue'
      }
    }
  },
  
  // Configuration pour la gestion des erreurs côté client
  CLIENT: {
    // Comportement par défaut pour les erreurs non gérées
    UNHANDLED_ERROR: {
      SHOW_MESSAGE: true,
      LOG_TO_CONSOLE: true,
      LOG_TO_SERVER: true,
      RELOAD_ON_CRITICAL: true,
      RELOAD_DELAY: 5000
    },
    
    // Configuration pour les notifications
    NOTIFICATIONS: {
      POSITION: 'top-right',
      DURATION: 5000,
      CLOSE_BUTTON: true,
      CLOSE_ON_CLICK: true,
      PAUSE_ON_HOVER: true,
      PAUSE_ON_FOCUS_LOSS: true,
      DRAGGABLE: true,
      DRAGGABLE_PERCENT: 0.6,
      SHOW_PROGRESS: true,
      RTL: false,
      THEME: 'light',
      TRANSITION: 'Vue-Toastification__bounce',
      MAX_TOASTS: 5,
      NEWEST_ON_TOP: true,
      FILTER_BEFORE_MOUNT: false,
      ON_MOUNTED: null,
      ON_CLOSE_COMPLETE: null,
      ON_CLICK: null,
      ON_CLOSE: null
    }
  }
};

/**
 * Mappe les codes d'erreur HTTP vers nos codes d'erreur personnalisés
 */
export const HTTP_ERROR_MAPPING: Record<number, number> = {
  // 4xx Client Errors
  400: ERROR_CODES.VALIDATION_ERROR,
  401: ERROR_CODES.UNAUTHORIZED,
  403: ERROR_CODES.FORBIDDEN,
  404: ERROR_CODES.NOT_FOUND,
  409: ERROR_CODES.RESOURCE_EXISTS,
  422: ERROR_CODES.VALIDATION_ERROR,
  
  // 5xx Server Errors
  500: ERROR_CODES.INTERNAL_SERVER_ERROR,
  502: ERROR_CODES.NETWORK_ERROR,
  503: ERROR_CODES.MAINTENANCE,
  504: ERROR_CODES.TIMEOUT
};

/**
 * Obtient le code d'erreur personnalisé à partir d'un code d'erreur HTTP
 */
export function getErrorCodeFromStatus(status: number): number {
  return HTTP_ERROR_MAPPING[status] || ERROR_CODES.INTERNAL_SERVER_ERROR;
}

/**
 * Obtient un message d'erreur à partir d'un code d'erreur
 */
export function getErrorMessage(code: number, defaultMessage: string = ERROR_MESSAGES.DEFAULT): string {
  const errorEntry = Object.entries(ERROR_CODES).find(([_, value]) => value === code);
  if (!errorEntry) return defaultMessage;
  
  const [key] = errorEntry;
  return ERROR_MESSAGES[key as keyof typeof ERROR_MESSAGES] || defaultMessage;
}
