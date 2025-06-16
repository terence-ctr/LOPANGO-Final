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
    return response;
  },
  async (error: AxiosError) => {
    if (!axios.isAxiosError(error)) {
      throw error;
    }
    const toast = useToast();
    
    // Log des erreurs
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        headers: error.config?.headers,
        data: error.config?.data
      }
    };
    
    console.error('[API] Erreur de réponse:', errorDetails);
    
    // Gestion des erreurs spécifiques
    if (error.response) {
      // Erreur 401 - Non autorisé
      if (error.response.status === 401) {
        handleUnauthorized();
        removeAuthToken();
        toast.error('Votre session a expiré. Veuillez vous reconnecter.');
      } 
      // Autres erreurs du serveur (400-500)
      else {
        const errorMessage = error.response.data?.message || 'Une erreur est survenue';
        toast.error(errorMessage);
      }
      
      // Ajouter les erreurs de validation si elles existent
      if (error.response.data?.errors) {
        error.validationErrors = error.response.data.errors;
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('[API] Aucune réponse du serveur:', error.request);
      toast.error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion.');
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('[API] Erreur de configuration:', error.message);
      toast.error('Erreur de configuration de la requête');
    }
    
    return Promise.reject(error);
  }
);

export default api;
