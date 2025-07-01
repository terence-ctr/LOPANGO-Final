// Configuration de l'API
export const apiConfig = {
  // URL de base de l'API - sera remplacée par les variables d'environnement en production
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  // URL de base de l'API (dépréciée, utiliser baseURL à la place)
  // @deprecated Utiliser baseURL à la place
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // Timeout des requêtes en millisecondes
  timeout: 10000, // 10 secondes
  
  // Configuration des endpoints
  // Les endpoints sont définis sans le préfixe /api car il est déjà inclus dans la baseURL
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      me: '/auth/me',
      refresh: '/auth/refresh-token',
      verify: '/auth/verify-token'
    },
    properties: {
      base: '/properties',
      search: '/properties/search',
      myProperties: '/properties/my-properties',
      byOwner: (ownerId: string) => `/properties/owner/${ownerId}`,
      byId: (id: string) => `/properties/${id}`,
      uploadImage: (propertyId: string) => `/properties/${propertyId}/images`,
    },
    metadata: {
      propertyTypes: '/metadata/property-types',
      propertyStatuses: '/metadata/property-statuses',
      propertyEquipments: '/metadata/property-equipments'
    },
    // Ajoutez d'autres endpoints au besoin
  },
  
  // Configuration des en-têtes par défaut
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Configuration des messages d'erreur par défaut
  errorMessages: {
    default: 'Une erreur est survenue. Veuillez réessayer plus tard.',
    network: 'Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.',
    unauthorized: 'Votre session a expiré. Veuillez vous reconnecter.',
    forbidden: 'Vous n\'êtes pas autorisé à effectuer cette action.',
    notFound: 'La ressource demandée est introuvable.',
    validation: 'Veuillez corriger les erreurs dans le formulaire.',
    tokenExpired: 'Votre session a expiré. Veuillez vous reconnecter.',
    refreshFailed: 'Impossible de rafraîchir votre session. Veuillez vous reconnecter.'
  },
  
  // Configuration des tokens
  tokens: {
    // Durée de validité du token d'accès en secondes (15 minutes)
    accessTokenExpiry: 15 * 60,
    // Durée de validité du refresh token en secondes (7 jours)
    refreshTokenExpiry: 7 * 24 * 60 * 60,
    // Marge de sécurité pour le rafraîchissement du token (5 minutes)
    refreshMargin: 5 * 60
  },
};

// Export par défaut pour la rétrocompatibilité
export default apiConfig;
