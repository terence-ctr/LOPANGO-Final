import api, { type ApiError } from './api';
import apiConfig from '@/config/api.config';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse 
} from '@/types/auth.types';
import type { 
  UserType, 
  User 
} from '@/types/user.types';

// Clés de stockage
const TOKEN_KEY = 'lopango_auth_token';
const REFRESH_TOKEN_KEY = 'lopango_refresh_token';
const USER_DATA_KEY = 'lopango_user_data';

// Étendre le type RegisterData pour inclure userType
interface ExtendedRegisterData extends Omit<RegisterData, 'passwordConfirmation'> {
  userType: UserType;
  address?: string;
}

const authService = {
  /**
   * Stocke les informations d'authentification
   */
  setAuthData(data: { token: string; refreshToken?: string; user: any }) {
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    if (data.user) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
    }
  },

  /**
   * Nettoie les données d'authentification
   */
  clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  /**
   * Rafraîchit le token d'authentification
   */
  async refreshToken(): Promise<{ token: string; user: any } | null> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('Aucun refresh token disponible');
    }

    try {
      const response = await api.post('/auth/refresh-token', {}, {
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      const { accessToken, user } = response.data.data || response.data;
      
      if (!accessToken) {
        throw new Error('Aucun token d\'accès reçu lors du rafraîchissement');
      }

      // Mettre à jour le token dans le stockage local
      this.setAuthData({ token: accessToken, user });
      
      return { token: accessToken, user };
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      // En cas d'erreur, nettoyer les données d'authentification
      this.clearAuthData();
      throw error;
    }
  },
  async login(credentials: LoginCredentials) {
    console.log(`[authService] Tentative de connexion pour:`, { 
      email: credentials.email ? `${credentials.email.substring(0, 3)}...` : 'non fourni',
      hasPassword: !!credentials.password,
      userType: credentials.userType || 'non fourni'
    });
    
    try {
      // Validation des entrées
      const missingFields: string[] = [];
      if (!credentials.email) missingFields.push('email');
      if (!credentials.password) missingFields.push('password');
      if (!credentials.userType) missingFields.push('userType');
      
      if (missingFields.length > 0) {
        const errorMessage = `Champs manquants: ${missingFields.join(', ')}`;
        console.error(`[authService] ${errorMessage}`);
        throw new Error(errorMessage);
      }

      // Créer un objet avec les champs nécessaires pour la connexion
      const loginData = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        userType: credentials.userType?.trim().toLowerCase() || ''
      };
      
      console.log(`[authService] Envoi de la requête de connexion avec les données:`, {
        email: loginData.email,
        hasPassword: !!loginData.password,
        userType: loginData.userType
      });
      
      const response = await api.post('/auth/login', loginData, {
        withCredentials: true,
        timeout: 10000 // 10 secondes de timeout
      });
      
      // Vérifier la structure de la réponse
      if (!response || !response.data) {
        console.error('[authService] Réponse vide du serveur');
        throw new Error('Réponse invalide du serveur');
      }
      
      console.log(`[authService] Réponse reçue avec succès, statut: ${response.status}`);
      
      // Vérifier la présence du token dans la réponse
      const responseData = response.data.data || response.data;
      const token = responseData?.tokens?.accessToken || responseData?.token || response.data?.tokens?.accessToken;
      
      if (!token) {
        console.error('[authService] Aucun token trouvé dans la réponse:', response.data);
        throw new Error("Aucun token d'authentification reçu");
      }
      
      // Stocker les tokens et les données utilisateur
      try {
        const refreshToken = responseData?.tokens?.refreshToken || response.data?.tokens?.refreshToken;
        const userData = responseData?.user || response.data.user;
        
        this.setAuthData({
          token,
          refreshToken,
          user: userData
        });
        
        console.log('[authService] Tokens et données utilisateur stockés avec succès');
        
        // Retourner les données formatées de manière cohérente
        return {
          ...response.data,
          token,
          refreshToken,
          user: userData
        };
      } catch (storageError) {
        console.error('[authService] Erreur lors du stockage des tokens:', storageError);
        throw new Error('Impossible de sauvegarder la session. Vérifiez les paramètres de votre navigateur.');
      }
      
    } catch (error: any) {
      console.error('[authService] Erreur lors de la connexion:', {
        message: error.message,
        status: error.response?.status,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data ? '***' : undefined
        },
        response: error.response?.data
      });
      
      // Gestion des erreurs réseau et de connexion
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('La connexion a expiré. Vérifiez votre connexion internet et réessayez.');
      }
      
      if (error.request || error.message?.includes('Network Error')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      }
      
      // Gestion des erreurs de l'API
      if (error.response) {
        const { status, data } = error.response;
        const errorMessage = data?.message || data?.error || error.message;
        
        // Créer une erreur enrichie avec plus d'informations
        const enhancedError = new Error(errorMessage);
        enhancedError.name = error.name || 'APIError';
        enhancedError.stack = error.stack;
        
        // Ajouter des métadonnées utiles
        (enhancedError as any).status = status;
        (enhancedError as any).response = error.response;
        
        // Gestion des codes d'erreur spécifiques
        if (status === 401) {
          enhancedError.message = 'Identifiants invalides. Veuillez vérifier vos informations de connexion.';
        } else if (status === 403) {
          enhancedError.message = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        } else if (status === 404) {
          enhancedError.message = 'Ressource non trouvée.';
        } else if (status === 429) {
          enhancedError.message = 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
        } else if (status >= 500) {
          enhancedError.message = 'Erreur serveur. Veuillez réessayer plus tard.';
        }
        
        throw enhancedError;
      }
      
      // Pour les autres erreurs inattendues
      console.error('Erreur inattendue lors de la connexion:', error);
      throw new Error('Une erreur inattendue est survenue. Veuillez réessayer ou contacter le support si le problème persiste.');
    }
  },

  async register(formData: FormData) {
    try {
      console.log('[authService] Envoi de la requête d\'inscription avec FormData');
      
      // Configuration spéciale pour l'envoi de FormData
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
        validateStatus: (status: number) => status < 500 // Ne pas lever d'erreur pour les erreurs 4xx
      };
      
      const response = await api.post('/auth/register', formData, config);
      
      console.log('[authService] Réponse du serveur:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      // Si le statut est une erreur client (4xx) ou serveur (5xx)
      if (response.status >= 400) {
        const errorData = response.data || {};
        const errorMessage = errorData.message || 'Erreur lors de l\'inscription';
        const error = new Error(errorMessage) as any;
        error.response = { data: errorData };
        error.code = errorData.code;
        console.error(`[authService] Erreur ${response.status}:`, errorMessage);
        throw error;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('[authService] Erreur lors de la requête d\'inscription:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data ? '***' : undefined
        }
      });
      
      // Si l'erreur a déjà été traitée, on la propage telle quelle
      if (error.response?.data) {
        throw error;
      }
      
      // Pour les autres erreurs, on crée un objet d'erreur cohérent
      const errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
      const newError = new Error(errorMessage) as any;
      newError.response = { data: { message: errorMessage, code: 'UNKNOWN_ERROR' } };
      throw newError;
    }
  },

  async getCurrentUser(): Promise<{ data: User }> {
    try {
      console.log('Récupération des informations utilisateur...');
      const token = localStorage.getItem('lopango_auth_token');
      
      // Vérifier d'abord si un token existe
      if (!token) {
        console.log('Aucun token trouvé dans le stockage local');
        throw new Error('Aucun token d\'authentification trouvé');
      }
      
      // Utiliser le chemin complet avec le préfixe /api
      const response = await api.get(`${apiConfig.endpoints.auth.me}`);
      console.log('URL de la requête:', `${apiConfig.apiUrl}${apiConfig.endpoints.auth.me}`);
      
      // Vérifier si la réponse contient des données valides
      if (!response?.data?.data) {
        console.error('Réponse invalide de l\'API:', response);
        throw new Error('Réponse invalide du serveur');
      }
      
      console.log('Rôle de l\'utilisateur:', response.data.data.userType);
      return response.data;
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      const status = error.response?.status;
      
      console.error('Erreur lors de la récupération des informations utilisateur:', {
        message: errorMessage,
        status: status,
        code: error.code
      });
      
      // Si l'erreur est 401 (non autorisé), nettoyer le stockage local
      if (status === 401) {
        console.log('Suppression du token invalide');
        localStorage.removeItem('token');
        
        // Rediriger vers la page de connexion si nous sommes sur une page protégée
        if (!window.location.pathname.includes('/auth/')) {
          console.log('Redirection vers la page de connexion');
          window.location.href = '/auth/login?session=expired';
        }
      }
      
      // Propager l'erreur pour une gestion ultérieure
      throw new Error(errorMessage);
    }
  },

  /**
   * Déconnexion de l'utilisateur
   * @param redirectToLogin Rediriger vers la page de connexion après déconnexion (par défaut: true)
   */
  async logout(redirectToLogin: boolean = true): Promise<{ success: boolean; message?: string }> {
    // Nettoyer les données d'authentification locales
    this.clearAuthData();
    // Vérifier si on est côté navigateur
    if (typeof window === 'undefined') {
      console.log('[authService] Fonction logout appelée côté serveur');
      return { success: false, message: 'Déconnexion non disponible côté serveur' };
    }

    const token = localStorage.getItem('token');
    
    // Si aucun token n'est présent, considérer comme déjà déconnecté
    if (!token) {
      console.log('[authService] Aucun token trouvé, utilisateur déjà déconnecté');
      return { success: true, message: 'Déjà déconnecté' };
    }

    try {
      console.log('[authService] Tentative de déconnexion...');
      
      // Appeler l'API de déconnexion avec le token actuel
      const response = await api.post('/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 5000,
        withCredentials: true
      });

      console.log('[authService] Réponse de déconnexion:', response.data);
      
      return { 
        success: true, 
        message: response.data?.message || 'Déconnexion réussie',
        data: response.data
      };
      
    } catch (error: any) {
      // Même en cas d'erreur, on continue le processus de déconnexion côté client
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      const status = error.response?.status;
      
      console.error('[authService] Erreur lors de la déconnexion côté serveur:', {
        message: errorMessage,
        status,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      // Si le token est invalide ou expiré, on considère quand même la déconnexion comme réussie
      if (status === 401 || status === 403) {
        console.log('[authService] Token invalide ou expiré, déconnexion locale');
        return { 
          success: true, 
          message: 'Session terminée',
          wasForced: true
        };
      }
      
      return { 
        success: false, 
        message: 'La déconnexion a réussi localement mais une erreur est survenue côté serveur',
        error: errorMessage,
        status
      };
      
    } finally {
      // Nettoyage côté client dans tous les cas
      try {
        // Supprimer les éléments liés à l'authentification
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Supprimer les éventuels autres tokens liés
        Object.keys(localStorage).forEach(key => {
          if (key.includes('token') || key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
        
        // Si une redirection est demandée et que nous ne sommes pas déjà sur la page de login
        if (redirectToLogin) {
          const loginPath = '/login';
          const currentPath = window.location.pathname;
          
          if (!currentPath.includes(loginPath)) {
            // Utiliser replaceState pour éviter de laisser la page précédente dans l'historique
            window.history.replaceState(null, '', loginPath);
            // Recharger la page pour s'assurer que l'état est propre
            window.location.reload();
          }
        }
      } catch (cleanupError) {
        console.error('[authService] Erreur lors du nettoyage côté client:', cleanupError);
        // En cas d'erreur critique, forcer un rechargement complet
        if (redirectToLogin) {
          window.location.href = '/login';
        }
      }
    }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      // Vérifier si le token est expiré
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      console.error('Erreur lors de la vérification du token:', e);
      return false;
    }
  },

  /**
   * Vérifie si le token est sur le point d'expirer
   */
  isTokenExpiringSoon(minutes = 5): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = (payload.exp * 1000 - Date.now()) / 1000 / 60; // en minutes
      return expiresIn < minutes;
    } catch (e) {
      console.error('Erreur lors de la vérification de l\'expiration du token:', e);
      return true;
    }
  },

  /**
   * Récupère le token d'authentification actuel
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  /**
   * Récupère le refresh token actuel
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  
  /**
   * Récupère les données utilisateur stockées
   */
  getUserData(): any | null {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  getAuthHeader() {
    return { 'Authorization': `Bearer ${this.getToken()}` };
  },
  
  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const user = this.getUserData();
    if (!user || !user.userType) return false;
    return user.userType.toLowerCase() === role.toLowerCase();
  },
  
  /**
   * Vérifie si l'utilisateur a l'un des rôles spécifiés
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }
};

export default authService;
