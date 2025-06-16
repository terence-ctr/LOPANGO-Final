import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from '@/types/user.types';
import type { RegisterData } from '@/types/auth.types';
import authService from '@/services/auth.service';
import { getDefaultRouteForRole } from '@/config/routes';

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

  // Vérifier l'état d'authentification
  const checkAuth = async (forceCheck = false): Promise<boolean> => {
    console.log('checkAuth appelé, forceCheck:', forceCheck);
    
    // Vérifier d'abord si un token est présent dans le localStorage
    const token = localStorage.getItem('token');
    
    // Si pas de token, l'utilisateur n'est pas authentifié
    if (!token) {
      console.log('Aucun token trouvé dans le localStorage');
      isAuthenticated.value = false;
      user.value = null;
      
      // Si on est sur une page protégée, sauvegarder l'URL pour rediriger après connexion
      const currentPath = window.location.pathname;
      const isProtectedRoute = !['/login', '/register', '/forgot-password'].includes(currentPath);
      
      if (isProtectedRoute && currentPath !== '/') {
        const redirectPath = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', redirectPath);
      }
      
      return false;
    }
    
    // Si déjà authentifié et pas de vérification forcée, retourner directement true
    if (!forceCheck && isAuthenticated.value && user.value) {
      console.log('Utilisateur déjà authentifié:', {
        email: user.value.email,
        role: user.value.userType,
        hasToken: true
      });
      return true;
    }
    
    // Éviter les appels concurrents
    if (loading.value) {
      console.log('Vérification d\'authentification déjà en cours');
      return isAuthenticated.value;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      // Le token est déjà récupéré plus haut
      console.log('Token trouvé dans le stockage local:', !!token);
      
      // Vérifier la validité du token auprès du serveur
      console.log('Vérification du token auprès du serveur...');
      const response = await authService.getCurrentUser().catch(async (error) => {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        
        // Si l'erreur est 401 (non autorisé), nettoyer l'état d'authentification
        if (error.response?.status === 401) {
          console.log('Session expirée ou invalide, déconnexion...');
          isAuthenticated.value = false;
          user.value = null;
          localStorage.removeItem('token');
          
          // Rediriger vers la page de connexion si nécessaire
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/auth/')) {
            window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
        
        throw error;
      });
      
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
        
        // Vérifier si l'utilisateur a le bon rôle pour la route actuelle
        const currentPath = window.location.pathname;
        const isAdminPath = currentPath.startsWith('/admin');
        const isTenantPath = currentPath.startsWith('/tenant');
        const isLandlordPath = currentPath.startsWith('/landlord');
        
        // Rediriger vers le tableau de bord approprié si nécessaire
        if (isAdminPath && userData.userType !== 'admin') {
          console.log('Redirection vers le tableau de bord approprié...');
          window.location.href = `/${userData.userType}/dashboard`;
        } else if ((isTenantPath || isLandlordPath) && !currentPath.includes(userData.userType)) {
          window.location.href = `/${userData.userType}/dashboard`;
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
      localStorage.setItem('token', token);
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
            localStorage.setItem('user', JSON.stringify(normalizedUser));
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
      localStorage.setItem('token', response.data.token);
      
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
      token: localStorage.getItem('token'),
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem(STORAGE_KEY);
    
    // Nettoyer les écouteurs d'événements si nécessaire
    if (cleanupSessionPersistence) {
      cleanupSessionPersistence();
      cleanupSessionPersistence = undefined;
    }
  };

  // Vérifier l'authentification stockée au démarrage
  const checkStoredAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Vérification de l\'authentification stockée, token présent:', !!token);
      
      if (token) {
        loading.value = true;
        const response = await authService.getCurrentUser();
        console.log('Réponse de getCurrentUser:', response);
        
        if (response?.data) {
          // S'assurer que le userType est en minuscules pour la cohérence
          const userData = response.data;
          if (userData.userType) {
            userData.userType = userData.userType.toString().toLowerCase().trim();
          } else if (userData.user_type) {
            // Gérer le cas où le champ s'appelle user_type au lieu de userType
            userData.userType = userData.user_type.toString().toLowerCase().trim();
            delete userData.user_type; // Nettoyer l'ancienne clé
          }
          
          console.log('Utilisateur chargé avec succès:', {
            id: userData.id,
            email: userData.email,
            userType: userData.userType,
            rawData: userData // Ajouter les données brutes pour le débogage
          });
          
          user.value = userData;
          isAuthenticated.value = true;
          
          // Sauvegarder l'utilisateur dans le stockage local
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          console.warn('Aucune donnée utilisateur dans la réponse');
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification stockée:', error);
      clearAuth();
    } finally {
      loading.value = false;
    }
  };

  // Vérifier l'authentification au chargement initial
  checkAuth();

  return {
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
    login,
    register,
    logout,
    
    // Méthodes internes exposées si nécessaire
    clearAuth
  }
});

export default useAuthStore;
