import api from './api';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse 
} from '@/types/auth.types';
import type { 
  UserType, 
  User 
} from '@/types/user.types';

// Étendre le type RegisterData pour inclure userType
interface ExtendedRegisterData extends Omit<RegisterData, 'passwordConfirmation'> {
  userType: UserType;
  address?: string;
}

const authService = {
  async login(credentials: LoginCredentials & { userType: string }) {
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
        userType: credentials.userType.trim().toLowerCase()
      };
      
      console.log(`[authService] Envoi de la requête de connexion`);
      
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
      const token = responseData?.token || response.data.token;
      
      if (!token) {
        console.error('[authService] Aucun token trouvé dans la réponse:', response.data);
        throw new Error("Aucun token d'authentification reçu");
      }
      
      // Stocker le token
      try {
        localStorage.setItem('token', token);
        console.log('[authService] Token stocké avec succès dans le localStorage');
      } catch (storageError) {
        console.error('[authService] Erreur lors du stockage du token:', storageError);
        throw new Error('Impossible de sauvegarder la session. Vérifiez les paramètres de votre navigateur.');
      }
      
      // Retourner les données formatées de manière cohérente
      return {
        ...response.data,
        token,
        user: responseData?.user || response.data.user
      };
      
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

  async register(userData: ExtendedRegisterData) {
    try {
      // Préparer les données pour l'inscription
      const registerData = {
        ...userData,
        address: {
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          postalCode: userData.address?.postalCode || '',
          country: userData.address?.country || 'France'
        },
        identity: {
          documentType: userData.identity?.documentType || 'permis de conduire',
          nationalId: userData.identity?.nationalId || '',
          verified: false
        },
        dateOfBirth: new Date().toISOString().split('T')[0],
        gender: 'male'
      };
      
      console.log('[authService] Envoi de la requête d\'inscription');
      
      const response = await api.post('/auth/register', registerData);
      
      console.log('[authService] Réponse du serveur:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      if (response.status >= 400) {
        const errorMessage = response.data?.message || 'Erreur lors de l\'inscription';
        console.error(`[authService] Erreur ${response.status}: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('[authService] Erreur lors de la requête d\'inscription:', {
        message: error.message,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data ? '***' : undefined
        }
      });
      
      let errorMessage = 'Erreur lors de l\'inscription';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  async getCurrentUser(): Promise<{ data: User }> {
    try {
      console.log('Récupération des informations utilisateur...');
      const token = localStorage.getItem('token');
      
      // Vérifier d'abord si un token existe
      if (!token) {
        console.log('Aucun token trouvé dans le stockage local');
        throw new Error('Aucun token d\'authentification trouvé');
      }
      
      const response = await api.get('/auth/me');
      
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
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000 // 5 secondes de timeout
      });

      console.log('[authService] Réponse de déconnexion:', response.data);
      
      return { success: true, message: 'Déconnexion réussie' };
      
    } catch (error: any) {
      // Même en cas d'erreur, on continue le processus de déconnexion côté client
      console.error('[authService] Erreur lors de la déconnexion côté serveur:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      return { 
        success: false, 
        message: 'La déconnexion a réussi localement mais une erreur est survenue côté serveur' 
      };
      
    } finally {
      // Nettoyage côté client dans tous les cas
      try {
        // Supprimer le token du stockage local
        localStorage.removeItem('token');
        
        // Si une redirection est demandée et que nous ne sommes pas déjà sur la page de login
        if (redirectToLogin && !window.location.pathname.includes('/login')) {
          // Utiliser replaceState pour éviter de laisser la page précédente dans l'historique
          window.history.replaceState(null, '', '/login');
          // Recharger la page pour s'assurer que l'état est propre
          window.location.reload();
        }
      } catch (cleanupError) {
        console.error('[authService] Erreur lors du nettoyage côté client:', cleanupError);
      }
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

export default authService;
