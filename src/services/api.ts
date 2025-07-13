import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import { apiConfig } from '@/config/api.config';
import { getAuthToken, setAuthToken, removeAuthToken } from '@/utils/auth';

// Interface pour les erreurs API
export interface ApiError extends Error {
  status?: number;
  code?: string;
  response?: any;
  config?: AxiosRequestConfig;
}

// Configuration de base de l'API
const api = axios.create({
  baseURL: apiConfig.baseURL,
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

// Flag pour éviter les boucles de rafraîchissement de token
let isRefreshing = false;
// File d'attente des requêtes en attente de rafraîchissement du token
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
  config: any;
}> = [];

// Fonction pour traiter la file d'attente après rafraîchissement du token
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.config.headers['Authorization'] = `Bearer ${token}`;
      api(prom.config).then(prom.resolve).catch(prom.reject);
    }
  });
  
  // Réinitialiser la file d'attente
  failedQueue = [];
};

// Fonction pour rafraîchir le token
const refreshToken = async (): Promise<string | null> => {
  try {
    console.log('Tentative de rafraîchissement du token...');
    // Utiliser l'URL complète avec le préfixe /api car le proxy le supprimera
    const response = await axios.post(
      `${apiConfig.baseURL}${apiConfig.endpoints.auth.refresh}`,
      {},
      { 
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Réponse du rafraîchissement du token:', response.data);
    
    // Vérifier la structure de la réponse
    const responseData = response.data?.data || response.data;
    const accessToken = responseData?.tokens?.accessToken || responseData?.accessToken;
    
    if (accessToken) {
      console.log('Nouveau token d\'accès obtenu avec succès');
      setAuthToken(accessToken);
      return accessToken;
    }
    
    console.error('Aucun token d\'accès trouvé dans la réponse:', response.data);
    return null;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    // Déconnecter l'utilisateur en cas d'erreur de rafraîchissement
    const authStore = useAuthStore();
    authStore.logout();
    return null;
  }
};

// Fonction pour obtenir les en-têtes d'authentification
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { 
    'Authorization': `Bearer ${token}`,
    'X-Auth-Token': token 
  } : {};
};

// Fonction pour vérifier si un token est expiré
export const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return true; // En cas d'erreur, considérer le token comme expiré
  }
};

// Fonction pour décoder un token JWT
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
};

// Intercepteur pour les requêtes sortantes
api.interceptors.request.use(
  (config) => {
    console.log('[API] Requête sortante:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      params: config.params,
      headers: config.headers,
      requestId: config.headers?.['X-Request-ID']
    });
    // Ne pas ajouter le token pour les routes publiques
    const publicEndpoints = [
      apiConfig.endpoints.auth.login,
      apiConfig.endpoints.auth.register,
      apiConfig.endpoints.auth.refresh,
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      // Ajouter les endpoints sans /api pour la rétrocompatibilité
      '/auth/forgot-password',
      '/auth/reset-password'
    ];
    
    // Normaliser les URLs pour la comparaison
    const normalizeUrl = (url: string) => url.replace(/^\/+|\/+$/g, '');
    const requestUrl = normalizeUrl(config.url || '');
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      requestUrl.endsWith(normalizeUrl(endpoint))
    );
    
    // Ajouter le token JWT s'il existe et si ce n'est pas une route publique
    if (!isPublicEndpoint) {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Enhanced logging for debugging permissions
        console.log(
          `[API DEBUG] Attaching auth token for protected endpoint: ${config.url}`,
          {
            url: config.url,
            token: token // Log the full token for debugging purposes
          }
        );
      } else {
        console.warn(`[API DEBUG] No auth token found for protected endpoint: ${config.url}`);
      }
    }
    
    // Ajouter un identifiant de requête unique pour le suivi
    if (!config.headers['X-Request-ID']) {
      config.headers['X-Request-ID'] = crypto.randomUUID();
    }
    
    // Log des requêtes sortantes en développement
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        headers: { ...config.headers, Authorization: '[REDACTED]' },
        params: config.params,
        requestId: config.headers['X-Request-ID']
      });
      
      // Ne pas logger les données sensibles en production
      if (config.data && !isPublicEndpoint) {
        console.log('[API] Request Data:', config.data);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Erreur de configuration de la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses entrantes
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('[API] Réponse reçue:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      requestId: response.config.headers?.['X-Request-ID'],
      data: response.data
    });
    
    // Log des réponses en développement
    if (import.meta.env.DEV) {
      const { config, status, data } = response;
      console.log(`[API] Réponse ${status} ${config.method?.toUpperCase()} ${config.url}`, {
        status,
        data,
        headers: response.headers,
        requestId: config.headers['X-Request-ID']
      });
    }
    
    return response;
  },
  async (error: any) => {
    // Si l'erreur n'a pas de config, c'est probablement une erreur réseau
    if (!error.config) {
      console.error('[API] Erreur réseau ou de configuration:', error.message);
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    
    // Si l'erreur est liée à une requête annulée
    if (axios.isCancel(error)) {
      console.log('[API] Requête annulée:', originalRequest.url);
      return Promise.reject(error);
    }

    // Log détaillé pour le débogage
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      console.error('[API] Erreur de réponse détaillée:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        config: error.config
      });
      console.error('[API] Erreur de réponse:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: originalRequest.url,
        method: originalRequest.method,
        data: error.response.data,
        headers: { ...error.response.headers, authorization: '[REDACTED]' },
        requestId: originalRequest.headers?.['X-Request-ID']
      });
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('[API] Pas de réponse du serveur:', {
        url: originalRequest.url,
        method: originalRequest.method,
        timeout: originalRequest.timeout,
        requestId: originalRequest.headers?.['X-Request-ID']
      });
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('[API] Erreur de configuration:', error.message, {
        url: originalRequest.url,
        method: originalRequest.method,
        requestId: originalRequest.headers?.['X-Request-ID']
      });
    }

    // Gestion des erreurs d'authentification (401 Unauthorized)
    if (error.response?.status === 401) {
      console.log('[API] Erreur 401 détectée, vérification du contexte...', {
        url: originalRequest.url,
        method: originalRequest.method,
        isRetry: originalRequest._retry,
        isRefreshRequest: originalRequest.url?.includes('/auth/refresh-token')
      });

      // Ne pas tenter de rafraîchir si c'est une requête de rafraîchissement qui a échoué
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        console.log('[API] Échec du rafraîchissement du token, déconnexion...');
        const authStore = useAuthStore();
        await authStore.logout();
        
        // Rediriger vers la page de connexion
        const currentPath = window.location.pathname + window.location.search;
        const loginUrl = currentPath === '/' ? '/login' : `/login?redirect=${encodeURIComponent(currentPath)}`;
        window.location.href = loginUrl + (loginUrl.includes('?') ? '&' : '?') + 'session=expired';
        return Promise.reject(error);
      }

      // Si le token est invalide ou expiré, on tente de le rafraîchir
      if (!originalRequest._retry) {
        console.log('[API] Tentative de rafraîchissement du token...');
        originalRequest._retry = true;
        
        try {
          // Utiliser le store d'authentification pour rafraîchir le token
          const authStore = useAuthStore();
          const refreshResult = await authStore.refreshToken(true);
          
          if (refreshResult?.token) {
            console.log('[API] Nouveau token obtenu, réessai de la requête...');
            // Mettre à jour le header d'autorisation avec le nouveau token
            originalRequest.headers.Authorization = `Bearer ${refreshResult.token}`;
            // Renvoyer la requête originale avec le nouveau token
            return api(originalRequest);
          } else {
            throw new Error('Échec du rafraîchissement du token: réponse invalide');
          }
        } catch (refreshError) {
          console.error('[API] Erreur lors du rafraîchissement du token:', refreshError);
          // En cas d'échec du rafraîchissement, déconnecter l'utilisateur
          const authStore = useAuthStore();
          await authStore.logout();
          
          // Rediriger vers la page de connexion
          const currentPath = window.location.pathname + window.location.search;
          const loginUrl = currentPath === '/' ? '/login' : `/login?redirect=${encodeURIComponent(currentPath)}`;
          window.location.href = loginUrl + (loginUrl.includes('?') ? '&' : '?') + 'session=expired';
          return Promise.reject(refreshError);
        }
      }
    }

    // Gestion des autres types d'erreurs
    const errorResponse = error.response?.data || {};
    const errorMessage = errorResponse.message || error.message || 'Une erreur est survenue';
    const errorCode = errorResponse.code || error.code || 'unknown_error';
    const validationErrors = errorResponse.errors || {};

    // Créer une erreur enrichie avec les données de la réponse
    const enhancedError: ApiError = new Error(errorMessage);
    enhancedError.name = 'ApiError';
    enhancedError.status = error.response?.status;
    enhancedError.code = errorCode;
    enhancedError.response = error.response;
    enhancedError.config = error.config;

    // Gestion des erreurs de validation (422 Unprocessable Entity)
    if (error.response?.status === 422 && Object.keys(validationErrors).length > 0) {
      const toast = useToast();
      const firstError = Object.values(validationErrors)[0];
      
      if (firstError) {
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        toast.error(errorMessage);
      }
    }
    
    // Gestion des erreurs serveur (500)
    if (error.response?.status >= 500) {
      const toast = useToast();
      toast.error('Une erreur serveur est survenue. Veuillez réessayer plus tard.');
    }
    
    // Gestion des erreurs de réseau
    if (error.code === 'ECONNABORTED') {
      const toast = useToast();
      toast.error('La connexion au serveur a expiré. Veuillez réessayer.');
    }
    
    // Gestion des erreurs de connexion
    if (!error.response) {
      const toast = useToast();
      toast.error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
    }

    return Promise.reject(enhancedError);
  }
);

// Export à la fois par défaut et nommé pour la compatibilité
export const apiClient = api;
export default api;
