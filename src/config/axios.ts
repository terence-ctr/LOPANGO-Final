import axios from 'axios';
import { apiConfig } from './api.config';

// Création d'une instance Axios avec une configuration de base
const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gestion des erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Gestion des erreurs HTTP
      console.error('Erreur API:', error.response.data);
      
      // Redirection vers la page de connexion en cas d'erreur 401 (non autorisé)
      if (error.response.status === 401) {
        // Vous pouvez ajouter une redirection vers la page de connexion ici
        console.error('Non autorisé - Redirection vers la page de connexion');
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Pas de réponse du serveur:', error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration de la requête:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export { api };
