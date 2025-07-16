// Interface pour la configuration de l'API
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  endpoints: {
    auth: {
      login: string;
      register: string;
      me: string;
      refresh: string;
      verify: string;
    };
    properties: {
      base: string;
      search: string;
      myProperties: string;
      byOwner: (ownerId: string) => string;
      byId: (id: string) => string;
      byIdWithTenant: (id: string, tenantId: string) => string;
      uploadImage: (propertyId: string) => string;
    };
    landlords: {
      base: string;
      byId: (id: string) => string;
    };
    metadata: {
      propertyTypes: string;
      propertyStatuses: string;
      propertyEquipments: string;
    };
    contracts: {
      base: string;
      byId: (id: string | number) => string;
      byTenant: (tenantId: string | number) => string;
      byLandlord: (landlordId: string | number) => string;
      byProperty: (propertyId: string | number) => string;
      create: string;
      update: (id: string | number) => string;
      delete: (id: string | number) => string;
      sign: (id: string | number) => string;
      download: (id: string | number) => string;
      myContracts: string;
      tenantContracts: string;
      landlordContracts: string;
    };
    messages: {
      base: string;
      create: string;
    };
  };
  headers: {
    [key: string]: string;
  };
  errorMessages: {
    [key: string]: string;
  };
  tokens: {
    accessTokenExpiry: number;
    refreshTokenExpiry: number;
    refreshMargin: number;
  };
}

// Configuration de l'API
export const apiConfig: ApiConfig = {
  // URL de base de l'API - sans le /api final car il est ajouté par le serveur
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, ''),
  
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
      byIdWithTenant: (id: string, tenantId: string) => `/properties/${id}?tenantId=${tenantId}`,
      uploadImage: (propertyId: string) => `/properties/${propertyId}/images`,
    },
    landlords: {
      base: '/landlords',
      byId: (id: string) => `/landlords/${id}`
    },
    metadata: {
      propertyTypes: '/metadata/property-types',
      propertyStatuses: '/metadata/property-statuses',
      propertyEquipments: '/metadata/property-equipments'
    },
    contracts: {
      base: '',
      byId: (id: string | number) => `/${id}`,
      byTenant: (tenantId: string | number) => `?tenantId=${tenantId}`,
      byLandlord: (landlordId: string | number) => `?landlordId=${landlordId}`,
      byProperty: (propertyId: string | number) => `?propertyId=${propertyId}`,
      create: '',
      update: (id: string | number) => `/${id}`,
      delete: (id: string | number) => `/${id}`,
      sign: (id: string | number) => `/${id}/sign`,
      download: (id: string | number) => `/${id}/download`,
      myContracts: '/me',
      tenantContracts: '/tenant/me',
      landlordContracts: '/landlord/me'
    },
    messages: {
      base: '/messages',
      create: '/messages'
    }
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
