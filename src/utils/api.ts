import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthToken, getRefreshToken, setAuthToken, setRefreshToken, isTokenExpiringSoon } from './auth';
import { useAuthStore } from '@/stores/auth';

// Créer une instance d'axios avec une configuration de base
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  async (config) => {
    // Ne pas intercepter les requêtes de rafraîchissement pour éviter les boucles infinies
    if (config.url?.includes('/auth/refresh-token')) {
      return config;
    }
    
    const token = getAuthToken();
    
    if (token) {
      // Vérifier si le token est sur le point d'expirer (dans les 5 minutes)
      if (isTokenExpiringSoon(5)) {
        console.log('Token sur le point d\'expirer, tentative de rafraîchissement préventif...');
        try {
          const authStore = useAuthStore();
          // Forcer le rafraîchissement même si la dernière tentative est récente
          const result = await authStore.refreshToken(true);
          
          if (result?.token) {
            console.log('Token rafraîchi avec succès en prévention d\'expiration');
            config.headers.Authorization = `Bearer ${result.token}`;
            // Mettre à jour le token dans le localStorage
            localStorage.setItem('token', result.token);
            if (result.user) {
              localStorage.setItem('user', JSON.stringify(result.user));
            }
            return config;
          }
        } catch (error) {
          console.error('Erreur lors du rafraîchissement préventif du token:', error);
          // Ne pas bloquer la requête en cas d'échec du rafraîchissement préventif
          // La requête échouera avec une 401 si le token est effectivement expiré
          // et sera gérée par l'intercepteur de réponse
        }
      }
      
      // Ajouter le token actuel à la requête
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajouter un identifiant unique à chaque requête pour le suivi
    config.headers['X-Request-ID'] = crypto.randomUUID();
    
    return config;
  },
  (error) => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Fonction pour rafraîchir le token d'accès
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
      {},
      {
        withCredentials: true, // Pour envoyer les cookies
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    );
    
    const newToken = response.data?.accessToken;
    if (!newToken) {
      throw new Error('Aucun token reçu dans la réponse');
    }
    
    // Mettre à jour le token dans le store et le localStorage
    const authStore = useAuthStore();
    authStore.setAuthToken(newToken);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
    }
    
    return newToken;
  } catch (error) {
    console.error('Échec du rafraîchissement du token:', error);
    // En cas d'échec, déconnecter l'utilisateur
    const authStore = useAuthStore();
    await authStore.logout();
    
    // Rediriger vers la page de connexion
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login?session=expired';
    }
    
    return null;
  }
}

// Intercepteur pour gérer les réponses et le rafraîchissement du token
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Vérifier si un nouveau token est disponible dans les en-têtes de la réponse
    const newToken = response.headers['x-new-access-token'] || response.headers['x-new-token'];
    const tokenExpiresAt = response.headers['x-token-expires-at'];
    
    if (newToken) {
      console.log('Nouveau token reçu dans la réponse');
      // Mettre à jour le token dans le store et le localStorage
      const authStore = useAuthStore();
      authStore.setAuthToken(newToken);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
        if (tokenExpiresAt) {
          localStorage.setItem('token_expires_at', tokenExpiresAt);
        }
      }
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Vérifier si la requête a été annulée ou n'a pas de réponse
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Erreur de connexion au serveur:', error.message);
      return Promise.reject(error);
    }

    // Si l'erreur est une 401 et qu'on n'a pas déjà tenté de rafraîchir
    if (error.response.status === 401 && !originalRequest._retry) {
      // Si c'était une tentative de rafraîchissement qui a échoué, déconnecter
      if (originalRequest.url?.includes('/auth/refresh')) {
        console.log('Échec du rafraîchissement du token, déconnexion...');
        const authStore = useAuthStore();
        await authStore.logout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      console.log('Token expiré, tentative de rafraîchissement...');

      try {
        // Tenter de rafraîchir le token
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          console.log('Token rafraîchi avec succès, nouvelle tentative de la requête...');
          // Mettre à jour le header d'autorisation
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Renvoyer la requête originale avec le nouveau token
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement du token:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    // Pour les autres erreurs 401, déconnecter l'utilisateur
    if (error.response.status === 401) {
      console.log('Accès non autorisé, déconnexion...');
      const authStore = useAuthStore();
      await authStore.logout();
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login?session=expired';
      }
    }

    // Pour les autres erreurs, les renvoyer telles quelles
    return Promise.reject(error);
  }
);

export default api;
