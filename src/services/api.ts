import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import apiConfig from '@/config/api.config';
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
    const authStore = useAuthStore();
    const response = await axios.post(
      `${apiConfig.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    
    const { access_token } = response.data;
    if (access_token) {
      setAuthToken(access_token);
      return access_token;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
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
    // Ne pas ajouter le token pour les routes publiques
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/forgot-password',
      '/auth/reset-password'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.startsWith(endpoint)
    );
    
    // Ajouter le token JWT s'il existe et si ce n'est pas une route publique
    if (!isPublicEndpoint) {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Si pas de token, supprimer l'en-tête d'autorisation
        delete config.headers.Authorization;
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
    const originalRequest = error.config;
    
    // Si l'erreur est liée à une requête annulée ou sans config
    if (axios.isCancel(error) || !originalRequest) {
      return Promise.reject(error);
    }
    
    // Log détaillé pour le débogage
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      console.error('[API] Erreur de réponse:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: originalRequest.url,
        method: originalRequest.method,
        data: error.response.data,
        headers: { ...error.response.headers, authorization: '[REDACTED]' },
        requestId: originalRequest.headers['X-Request-ID']
      });
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('[API] Pas de réponse du serveur:', {
        url: originalRequest.url,
        method: originalRequest.method,
        timeout: originalRequest.timeout,
        requestId: originalRequest.headers['X-Request-ID']
      });
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('[API] Erreur de configuration:', error.message, {
        url: originalRequest.url,
        method: originalRequest.method,
        requestId: originalRequest.headers['X-Request-ID']
      });
    }

    // Gestion des erreurs d'authentification (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Éviter les boucles de rafraîchissement
      if (originalRequest.url?.includes('/auth/refresh')) {
        // Si on est déjà en train de rafraîchir le token et qu'on reçoit encore une 401
        console.error('[API] Échec du rafraîchissement du token, déconnexion...');
        const authStore = useAuthStore();
        await authStore.logout();
        return Promise.reject(error);
      }

      // Si c'est la première tentative et qu'on n'est pas déjà en train de rafraîchir
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const newToken = await refreshToken();
          
          if (newToken) {
            // Mettre à jour le token dans les en-têtes
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Traiter la file d'attente avec le nouveau token
            processQueue(null, newToken);
            
            // Renvoyer la requête originale avec le nouveau token
            return api(originalRequest);
          } else {
            // Si le rafraîchissement échoue, déconnecter l'utilisateur
            const authStore = useAuthStore();
            await authStore.logout();
            
            // Rediriger vers la page de connexion
            if (!window.location.pathname.includes('/auth/login')) {
              window.location.href = '/auth/login?session=expired';
            }
            
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.error('[API] Erreur lors du rafraîchissement du token:', refreshError);
          processQueue(refreshError, null);
          
          // Déconnecter l'utilisateur en cas d'échec du rafraîchissement
          const authStore = useAuthStore();
          await authStore.logout();
          
          // Rediriger vers la page de connexion
          if (!window.location.pathname.includes('/auth/login')) {
            window.location.href = '/auth/login?session=expired';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Si un rafraîchissement est déjà en cours, mettre en file d'attente la requête
        return new Promise((resolve, reject) => {
          failedQueue.push({ 
            resolve, 
            reject, 
            config: originalRequest 
          });
        });
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

export default api;
