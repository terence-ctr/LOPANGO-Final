// Configuration de l'API
const config = {
  // URL de base de l'API - sera remplacée par les variables d'environnement en production
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // Timeout des requêtes en millisecondes
  timeout: 30000, // 30 secondes
  
  // Configuration des endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      me: '/auth/me',
      refresh: '/auth/refresh'
    },
    properties: {
      base: '/properties',
      search: '/properties/search',
      myProperties: '/properties/owner/my-properties',
      byOwner: (ownerId: string) => `/properties/owner/${ownerId}`,
      byId: (id: string) => `/properties/${id}`,
      uploadImage: (propertyId: string) => `/properties/${propertyId}/images`,
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
    unauthorized: 'Vous devez être connecté pour accéder à cette ressource.',
    forbidden: 'Vous n\'êtes pas autorisé à effectuer cette action.',
    notFound: 'La ressource demandée est introuvable.',
    validation: 'Veuillez corriger les erreurs dans le formulaire.',
  },
};

export default config;
