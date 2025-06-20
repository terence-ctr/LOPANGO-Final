import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from '@/types/user.types';
import type { RegisterData } from '@/types/auth.types';
import apiConfig from '@/config/api.config';
import authService from '@/services/auth.service';
import { getDefaultRouteForRole } from '@/config/routes';
import { TOKEN_KEY, USER_DATA_KEY } from '@/utils/auth';
import api from '@/services/api';

// Clé pour le stockage local
const STORAGE_KEY = 'lopango_auth';

// Interface pour l'état d'authentification
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const currentUser = computed(() => user.value);
  const isAuth = computed(() => isAuthenticated.value);
  const isLoading = computed(() => loading.value);
  const authError = computed(() => error.value);
  
  // Récupérer le type d'utilisateur en minuscules
  const userType = computed(() => {
    return user.value?.userType?.toString().toLowerCase().trim() || '';
  });

  const setUser = (userData: User | null) => {
    user.value = userData;
    isAuthenticated.value = !!userData;
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  // Délai minimum entre deux rafraîchissements de token (5 minutes en millisecondes)
  const MIN_REFRESH_DELAY = 5 * 60 * 1000;
  let lastRefreshTime = 0;
  let isRefreshing = false;
  let refreshPromise: Promise<{token: string, user: User} | null> | null = null;

  // Rafraîchir le token d'authentification avec gestion de la concurrence et du délai minimum
  const refreshToken = async (force = false): Promise<{token: string, user: User} | null> => {
    const now = Date.now();
    
    // Si un rafraîchissement est déjà en cours, retourner la même promesse
    if (isRefreshing && refreshPromise) {
      console.log('[Auth] Rafraîchissement déjà en cours, réutilisation de la même promesse');
      return refreshPromise;
    }
    
    // Vérifier le délai minimum entre les rafraîchissements
    if (!force && now - lastRefreshTime < MIN_REFRESH_DELAY) {
      console.log('[Auth] Délai minimum non écoulé depuis le dernier rafraîchissement');
      return Promise.resolve(null);
    }
    
    // Marquer qu'un rafraîchissement est en cours
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        console.log('[Auth] Début du rafraîchissement du token');
        
        // Récupérer le refresh token depuis le cookie
        const refreshToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('refreshToken='))
          ?.split('=')[1];

        if (!refreshToken) {
          throw new Error('Aucun refresh token trouvé');
        }

        // Utiliser l'API avec withCredentials pour inclure automatiquement les cookies
        const response = await axios.post(
          `${apiConfig.baseURL}${apiConfig.endpoints.auth.refresh}`,
          {},
          {
            withCredentials: true,
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Accept': 'application/json'
            }
          }
        );
        
        if (response.data?.tokens?.accessToken) {
          console.log('[Auth] Token rafraîchi avec succès');
          lastRefreshTime = Date.now();
          
          // Mettre à jour le token dans le localStorage
          localStorage.setItem('token', response.data.tokens.accessToken);
          
          // Mettre à jour l'utilisateur si les données sont disponibles
          if (response.data.user) {
            user.value = response.data.user;
          }
          
          return {
            token: response.data.tokens.accessToken,
            user: response.data.user || user.value
          };
        }
        return null;
      } catch (error) {
        console.error('[Auth] Erreur lors du rafraîchissement du token:', error);
        // En cas d'erreur, réinitialiser le délai pour permettre une nouvelle tentative
        lastRefreshTime = 0;
        // Déconnecter l'utilisateur en cas d'erreur de rafraîchissement
        await logout();
        throw error;
      } finally {
        // Réinitialiser l'état de rafraîchissement
        isRefreshing = false;
        refreshPromise = null;
      }
    })();
    
    return refreshPromise;
  };

  // Vérifier le token côté serveur
  const verifyTokenWithServer = async (token: string): Promise<boolean> => {
    try {
      // D'abord, essayer de rafraîchir le token
      const refreshed = await refreshToken();
      
      if (refreshed) {
        // Mettre à jour le token et l'utilisateur
        localStorage.setItem(TOKEN_KEY, refreshed.token);
        user.value = refreshed.user;
        isAuthenticated.value = true;
        return true;
      }
      
      // Si le rafraîchissement échoue, essayer de vérifier le token existant
      const response = await api.get(apiConfig.endpoints.auth.verify, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.valid) {
        // Mettre à jour l'état d'authentification avec les données du serveur
        user.value = response.data.user;
        isAuthenticated.value = true;
        
        // Sauvegarder le token s'il a été rafraîchi
        if (response.data.token) {
          localStorage.setItem(TOKEN_KEY, response.data.token);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return false;
    }
  };

  // Fonction utilitaire pour rediriger vers la page de connexion
  const redirectToLogin = () => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth/')) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  };
  
  // Fonction utilitaire pour obtenir la route par défaut en fonction du rôle
  const getDefaultRouteForRole = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'agent':
        return '/agent/dashboard';
      case 'user':
      default:
        return '/dashboard';
    }
  };
  
  // Fonction de vérification de l'authentification
  const checkAuth = async (forceCheck = false): Promise<boolean> => {
    console.log('[Auth] Vérification de l\'authentification, forceCheck:', forceCheck);
    
    // Si l'utilisateur est déjà authentifié et qu'on ne force pas la vérification
    if (isAuthenticated.value && !forceCheck) {
      console.log('[Auth] Déjà authentifié, vérification non forcée');
      return true;
    }
    
    // Vérifier d'abord le token stocké localement
    const token = getAuthToken();
    
    if (!token) {
      console.log('[Auth] Aucun token trouvé dans le stockage local');
      clearAuth();
      redirectToLogin();
      return false;
    }
    
    // Éviter les appels concurrents
    if (loading.value) {
      console.log('Vérification d\'authentification déjà en cours');
      return isAuthenticated.value;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      // Vérifier si le token est expiré ou va bientôt expirer (dans les 5 minutes)
      const isExpired = isTokenExpired(token);
      const willExpireSoon = isTokenExpired(token, 5 * 60); // 5 minutes
      
      if (isExpired) {
        console.log('[Auth] Token expiré, tentative de rafraîchissement...');
        try {
          const refreshResult = await refreshToken(true); // Forcer le rafraîchissement
          if (refreshResult && refreshResult.token) {
            // Mettre à jour le token dans le stockage local
            setAuthToken(refreshResult.token);
            // Mettre à jour l'utilisateur
            user.value = refreshResult.user;
            isAuthenticated.value = true;
            error.value = null;
            loading.value = false;
            return true;
          } else {
            console.log('[Auth] Échec du rafraîchissement du token: réponse vide');
            clearAuth();
            loading.value = false;
            redirectToLogin();
            return false;
          }
        } catch (error) {
          console.error('[Auth] Erreur lors du rafraîchissement du token:', error);
          clearAuth();
          loading.value = false;
          redirectToLogin();
          return false;
        }
      } else if (willExpireSoon) {
        // Rafraîchir le token de manière proactive s'il va bientôt expirer
        console.log('[Auth] Token va bientôt expirer, rafraîchissement proactif...');
        refreshToken().then(result => {
          if (result && result.token) {
            setAuthToken(result.token);
            user.value = result.user;
            isAuthenticated.value = true;
          }
        }).catch(err => {
          console.error('[Auth] Échec du rafraîchissement proactif du token:', err);
        });
      }

      // Vérifier le token côté serveur
      const response = await authService.getCurrentUser();
      
      if (response?.data) {
        // S'assurer que le userType est correctement défini
        const userData = response.data;
        
        // Normaliser le userType
        if (userData.userType) {
          userData.userType = userData.userType.toString().toLowerCase().trim();
        } else if (userData.user_type) {
          userData.userType = userData.user_type.toString().toLowerCase().trim();
          delete userData.user_type; // Nettoyer l'ancienne clé
        }
        
        console.log('Utilisateur authentifié avec succès:', {
          id: userData.id,
          email: userData.email,
          userType: userData.userType,
          hasRole: !!userData.userType,
          rawData: userData
        });
        
        // Mettre à jour l'état de l'utilisateur
        user.value = userData;
        isAuthenticated.value = true;
        
        // Obtenir la route par défaut pour le type d'utilisateur
        const defaultRoute = getDefaultRouteForRole(userData.userType);
        const currentPath = window.location.pathname;
        
        console.log('Vérification de la redirection après connexion:', {
          userType: userData.userType,
          currentPath,
          defaultRoute
        });
        
        // Ne pas rediriger si l'utilisateur est déjà sur une page de son espace
        const isOnAuthorizedPath = currentPath.startsWith(`/${userData.userType}`);
        const isOnAuthPage = ['/login', '/register', '/forgot-password'].includes(currentPath);
        
        // Rediriger si:
        // 1. L'utilisateur est sur une page d'authentification après une connexion réussie
        // 2. OU l'utilisateur n'est pas sur une page autorisée pour son rôle
        if (isOnAuthPage || !isOnAuthorizedPath) {
          console.log(`Redirection vers la route par défaut pour ${userData.userType}:`, defaultRoute);
          window.location.href = defaultRoute;
        }
        
        return true;
      }
      
      // Si la vérification échoue, déconnecter l'utilisateur
      console.log('Échec de la vérification du token, déconnexion...');
      await logout();
      return false;
      
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'authentification:', err);
      
      // Ne pas afficher d'erreur pour les erreurs 401 (gérées dans le catch précédent)
      if (err.response?.status !== 401) {
        error.value = 'Erreur lors de la vérification de l\'authentification';
      }
      
      // Mettre à jour l'état d'authentification
      isAuthenticated.value = false;
      user.value = null;
      
      return false;
    } finally {
      loading.value = false;
      console.log('Fin de checkAuth, isAuthenticated:', isAuthenticated.value);
    }
  };
  
  // Connexion
  const login = async (credentials: { email: string; password: string; userType: string }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { email, password, userType } = credentials;
      
      console.log('Tentative de connexion avec:', { email, userType });
      
      const response = await authService.login({ email, password, userType });
      console.log('Réponse brute du service:', response);

      // Vérifier la structure de la réponse
      if (!response) {
        throw new Error('Aucune réponse du serveur');
      }

      // Vérifier le token dans différentes parties de la réponse
      const token = response.token || (response as any)?.data?.token;
      const userData = response.user || (response as any)?.data?.user;
      
      if (!token) {
        console.error('Aucun token trouvé dans la réponse:', response);
        throw new Error("Aucun token d'authentification reçu");
      }

      console.log('Token reçu, tentative de sauvegarde...');
      localStorage.setItem(TOKEN_KEY, token);
      console.log('Token sauvegardé avec succès dans le localStorage');

      // Mettre à jour l'état d'authentification
      isAuthenticated.value = true;
      
      if (userData) {
        user.value = userData;
      }
      
      // Fonction pour normaliser les données utilisateur
      const normalizeUserData = (userData: any) => {
        if (!userData) return null;
        
        // Créer une copie de l'objet utilisateur
        const normalizedUser = { ...userData };
        
        // Normaliser le userType
        if (normalizedUser.userType) {
          normalizedUser.userType = normalizedUser.userType.toString().toLowerCase().trim();
        } else if (normalizedUser.user_type) {
          normalizedUser.userType = normalizedUser.user_type.toString().toLowerCase().trim();
          delete normalizedUser.user_type; // Nettoyer l'ancienne clé
        } else if (credentials.userType) {
          normalizedUser.userType = credentials.userType.toLowerCase().trim();
        }
        
        // S'assurer que le nom est correctement formaté
        if (!normalizedUser.name && (normalizedUser.firstName || normalizedUser.lastName)) {
          normalizedUser.name = `${normalizedUser.firstName || ''} ${normalizedUser.lastName || ''}`.trim();
        }
        
        return normalizedUser;
      };
      
      // Si la réponse contient les données utilisateur, les stocker
      if (response.user || (response.data && response.data.user)) {
        const userData = response.user || response.data.user;
        const normalizedUser = normalizeUserData(userData);
        
        if (normalizedUser) {
          user.value = normalizedUser;
          // Sauvegarder l'utilisateur dans le stockage local
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          console.log('Utilisateur connecté et sauvegardé:', {
            email: normalizedUser.email,
            userType: normalizedUser.userType,
            id: normalizedUser.id
          });
        }
      } else {
        // Sinon, récupérer les informations utilisateur
        console.log('Récupération des informations utilisateur...');
        await checkAuth();
        // Normaliser les données utilisateur après la vérification
        if (user.value) {
          const normalizedUser = normalizeUserData(user.value);
          if (normalizedUser) {
            user.value = normalizedUser;
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(normalizedUser));
          }
        }
      }
      
      // Nettoyer l'URL de redirection après une connexion réussie
      localStorage.removeItem('redirectAfterLogin');
      
      return true;
        
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', {
        message: err.message,
        response: err.response?.data,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
      
      // Gestion des erreurs spécifiques
      if (err.response) {
        const { status, data } = err.response;
        
        if (status === 401) {
          error.value = 'Adresse e-mail ou mot de passe incorrect.';
        } else if (status === 500) {
          error.value = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (data?.message) {
          error.value = String(data.message);
        } else {
          error.value = `Erreur ${status}: Une erreur est survenue`;
        }
      } else {
        error.value = err.message || 'Une erreur inconnue est survenue lors de la connexion.';
      }
      
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Inscription
  const register = async (userData: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Tentative d\'inscription avec les données:', userData);
      
      const response = await authService.register(userData);
      
      setUser(response.data);
      localStorage.setItem(TOKEN_KEY, response.data.token);
      
      // Rediriger vers la page demandée ou la page par défaut
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '';
      localStorage.removeItem('redirectAfterLogin'); // Nettoyer l'ancienne redirection
      
      if (redirectPath) {
        window.location.href = redirectPath;
      } else {
        // Rediriger vers le tableau de bord par défaut selon le rôle
        const defaultRoute = getDefaultRouteForRole(response.data.userType);
        router.push(defaultRoute);
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setError('Une erreur est survenue lors de l\'inscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      clearAuth();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  };

  // Sauvegarder l'état d'authentification
  const saveAuthState = (): void => {
    const authState: AuthState = {
      user: user.value,
      token: localStorage.getItem(TOKEN_KEY),
      isAuthenticated: isAuthenticated.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  };

  // Désactiver les rafraîchissements automatiques
  const disablePageRefresh = (): (() => void) => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      return () => {}; // Retourner une fonction vide côté serveur
    }

    // Désactiver F5, Ctrl+R, Ctrl+Shift+R, etc.
    const preventRefresh = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'r' || e.key === 'R' || e.key === 'F5')) ||
        e.key === 'F5' ||
        e.key === 'F11' ||
        (e.key === 'r' && e.altKey) ||
        (e.key === 'R' && e.altKey) ||
        (e.key === 'F5' && e.shiftKey)
      ) {
        e.preventDefault();
        console.log('Rafraîchissement désactivé');
        return false;
      }
      return undefined;
    };

    // Désactiver le menu contextuel (clic droit)
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Désactiver le rafraîchissement avec la molette de la souris
    const preventMouseWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        return false;
      }
      return undefined;
    };

    // Désactiver le rafraîchissement tactile
    const preventTouchRefresh = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      
      const startY = touch.pageY;
      
      const handleTouchMove = (moveEvent: TouchEvent) => {
        if (!moveEvent.touches[0]) return;
        const moveY = moveEvent.touches[0].pageY;
        if (moveY < startY && window.scrollY <= 0) {
          moveEvent.preventDefault();
        }
      };

      window.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
      
      const removeTouchMove = () => {
        window.removeEventListener('touchmove', handleTouchMove as EventListener);
        window.removeEventListener('touchend', removeTouchMove);
      };
      
      window.addEventListener('touchend', removeTouchMove, { once: true });
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener('keydown', preventRefresh as EventListener, { capture: true });
    window.addEventListener('contextmenu', preventContextMenu as EventListener, { capture: true });
    window.addEventListener('wheel', preventMouseWheel as EventListener, { passive: false });
    window.addEventListener('touchstart', preventTouchRefresh as EventListener, { passive: false });

    // Nettoyer les écouteurs lors de la déconnexion
    return () => {
      window.removeEventListener('keydown', preventRefresh as EventListener, { capture: true });
      window.removeEventListener('contextmenu', preventContextMenu as EventListener, { capture: true });
      window.removeEventListener('wheel', preventMouseWheel as EventListener);
      window.removeEventListener('touchstart', preventTouchRefresh as EventListener);
    };
  };

  // Type pour la fonction de nettoyage
  type CleanupFunction = () => void;
  
  // Variable pour stocker la fonction de nettoyage
  let cleanupSessionPersistence: CleanupFunction | undefined;

  // Initialiser la persistance de session
  const initSessionPersistence = (): (() => void) => {
    // Désactiver le rafraîchissement de page
    cleanupSessionPersistence = disablePageRefresh();
    
    // Nettoyer lors de la déconnexion
    return (): void => {
      if (cleanupSessionPersistence) {
        cleanupSessionPersistence();
      }
    };
  };

  // Fonction pour charger l'état d'authentification stocké
  const loadStoredAuth = () => {
    const storedAuth = localStorage.getItem(STORAGE_KEY);
    if (storedAuth) {
      try {
        const authState = JSON.parse(storedAuth) as AuthState;
        if (authState.token && authState.user) {
          user.value = authState.user;
          isAuthenticated.value = authState.isAuthenticated;
          console.log('État d\'authentification chargé depuis le stockage local');
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'état d\'authentification:', err);
        clearAuth();
      }
    }
  };

  if (typeof window !== 'undefined') {
    // Charger l'état d'authentification au démarrage
    loadStoredAuth();
    
    // Initialiser la persistance de session
    initSessionPersistence();
    
    // Sauvegarder l'état à chaque changement
    watch([user, isAuthenticated], () => {
      saveAuthState();
    }, { deep: true });
  }

  // Nettoyer l'authentification
  const clearAuth = () => {
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(STORAGE_KEY);
    
    // Nettoyer les écouteurs d'événements si nécessaire
    if (cleanupSessionPersistence) {
      cleanupSessionPersistence();
      cleanupSessionPersistence = undefined;
    }
  };

  // Fonction pour obtenir le token d'authentification
  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  };

  // Fonction pour définir le token d'authentification
  const setAuthToken = (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  };

  // Fonction pour vérifier si un token est expiré
  const isTokenExpired = (token: string, bufferSeconds = 0): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now + bufferSeconds;
    } catch (e) {
      console.error('Erreur lors de la vérification du token:', e);
      return true;
    }
  };

  // Vérifier l'authentification au chargement initial
  checkAuth();

  return {
    // Fonctions d'aide
    getAuthToken,
    setAuthToken,
    isTokenExpired,
    // State
    user,
    isAuthenticated,
    loading,
    error,
    
    // Getters
    currentUser,
    isAuth,
    isLoading,
    authError,
    userType,
    
    // Actions
    setUser,
    setLoading,
    setError,
    clearError,
    checkAuth,
    refreshToken,
    login,
    register,
    logout,
    
    // Méthodes internes exposées si nécessaire
    clearAuth
  };
});

export default useAuthStore;
