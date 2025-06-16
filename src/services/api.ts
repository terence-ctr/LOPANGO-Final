import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import apiConfig from '@/config/api.config';
import { handleUnauthorized, getAuthToken, removeAuthToken } from '@/utils/auth';

// Configuration de base de l'API
const api = axios.create({
  baseURL: apiConfig.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true, // Important pour envoyer les cookies avec les requêtes cross-origin
  timeout: apiConfig.timeout,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  // Désactiver la transformation automatique des réponses
  transformResponse: [(data) => {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }]
});

// Fonction pour obtenir les en-têtes d'authentification
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Intercepteur pour les requêtes sortantes
api.interceptors.request.use(
  (config) => {
    console.log('[API] Envoi de la requête:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers
    });
    
    // Ajouter le token JWT s'il existe
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Si pas de token, supprimer l'en-tête d'autorisation
      delete config.headers.Authorization;
    }
    
    // Ajouter un identifiant de requête unique
    if (!config.headers['X-Request-ID']) {
      config.headers['X-Request-ID'] = Date.now().toString();
    }
    
    // Log des requêtes sortantes en développement
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params,
        requestId: config.headers['X-Request-ID']
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses entrantes
api.interceptors.response.use(
  (response) => {
    // Log des réponses en développement
    if (import.meta.env.DEV) {
      console.log(`[API] Réponse ${response.status} ${response.config.url}`, response.data);
    }
    
    // Log détaillé pour le débogage
    console.log('[API] Réponse reçue:', {
      status: response.status,
      url: response.config.url,
      baseURL: response.config.baseURL,
      data: response.data
    });
    
    return response;
  },
  async (error) => {
    // Log détaillé pour le débogage
    console.error('[API] Erreur complète:', error);
    
    // Log les détails de la requête qui a échoué
    if (error.config) {
      console.error('[API] Détails de la requête échouée:', {
        method: error.config.method?.toUpperCase(),
        url: error.config.url,
        baseURL: error.config.baseURL,
        headers: error.config.headers,
        data: error.config.data
      });
    } else if (error.request) {
      console.error('[API] Pas de réponse reçue. Détails de la requête:', error.request);
    } else {
      console.error('[API] Erreur lors de la configuration de la requête:', error.message);
    }

    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      // Si le token a expiré, on tente de le rafraîchir
      if (error.config.url !== '/auth/refresh' && error.config.url !== '/auth/login') {
        try {
          const newToken = await handleUnauthorized();
          if (newToken) {
            // On réessaie la requête avec le nouveau token
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return api(error.config);
          }
        } catch (refreshError) {
          console.error('Erreur lors du rafraîchissement du token:', refreshError);
          // Si le rafraîchissement échoue, on déconnecte l'utilisateur
          const authStore = useAuthStore();
          authStore.logout();
        }
      }

      // Rediriger vers la page de connexion si on est pas déjà sur la page de connexion
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login?session=expired';
      }
    }

    // Gestion des erreurs de validation
    if (error.response?.status === 422) {
      const toast = useToast();
      const errors = error.response.data.errors || {};
      
      // Afficher la première erreur de validation
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
