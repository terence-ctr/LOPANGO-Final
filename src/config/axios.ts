import axios from 'axios';
import { apiConfig } from './api.config';
import { useRouter } from 'vue-router';

// Création d'une instance Axios avec une configuration de base
const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
    // Suppression de 'Expires' qui peut causer des problèmes CORS
  },
  withCredentials: true // Important pour les cookies de session
});

// Liste des endpoints qui ne nécessitent pas d'authentification
const publicEndpoints = [
  '/auth/login',
  '/auth/refresh-token',
  '/auth/forgot-password',
  '/auth/reset-password'
];

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    // Ne pas ajouter le token pour les endpoints publics
    if (publicEndpoints.some(endpoint => config.url?.includes(endpoint))) {
      return config;
    }

    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('lopango_auth_token') || localStorage.getItem('token');
    
    console.log('En-têtes de la requête avant modification:', config.headers);
    console.log('Token utilisé pour l\'authentification:', token ? 'Présent' : 'Manquant');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Aucun token d\'authentification trouvé');
      // Ne pas rejeter ici, laisser le serveur gérer l'authentification
    }
    
    return config;
  },
  (error) => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Gestion des erreurs globales
api.interceptors.response.use(
  (response) => {
    console.log('Réponse reçue:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si la requête a échoué avec une erreur 401 et que ce n'est pas une tentative de rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('Session expirée, tentative de rafraîchissement du token...');
      
      try {
        // Tenter de rafraîchir le token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${apiConfig.baseURL}/auth/refresh-token`, { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data;
          
          // Mettre à jour les tokens
          localStorage.setItem('token', token);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          // Mettre à jour l'en-tête d'autorisation
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Renvoyer la requête originale avec le nouveau token
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Échec du rafraîchissement du token:', refreshError);
        // Rediriger vers la page de connexion en cas d'échec
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
      
      // Si on arrive ici, c'est qu'on n'a pas pu rafraîchir le token
      window.location.href = '/login?session=expired';
    }
    
    // Gestion des autres erreurs
    if (error.response) {
      console.error('Erreur API:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.config?.headers
      });
      
      // Gestion spécifique des erreurs courantes
      if (error.response.status === 403) {
        console.error('Accès refusé - Vous n\'avez pas les droits nécessaires');
        // Rediriger vers une page d'erreur ou afficher un message
      } else if (error.response.status === 404) {
        console.error('Ressource non trouvée');
      } else if (error.response.status >= 500) {
        console.error('Erreur serveur - Veuillez réessayer plus tard');
      }
    } else if (error.request) {
      console.error('Pas de réponse du serveur - Vérifiez votre connexion internet');
    } else {
      console.error('Erreur de configuration de la requête:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export { api };
