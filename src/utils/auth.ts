import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

// Clés de stockage
export const TOKEN_KEY = 'lopango_auth_token';
export const REFRESH_TOKEN_KEY = 'lopango_refresh_token';
export const USER_DATA_KEY = 'lopango_user_data';

// Types
type TokenType = string | null;

/**
 * Vérifie si un token JWT est valide et non expiré
 */
export const isTokenValid = (token: TokenType): boolean => {
  if (!token) return false;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Vérifier si le token est expiré (avec une marge de 5 minutes)
    return payload.exp > (currentTime - 300);
  } catch (error) {
    console.error('Erreur lors de la validation du token:', error);
    return false;
  }
};

/**
 * Récupère le token d'authentification depuis le stockage local
 */
export const getAuthToken = (): TokenType => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Définit le token d'authentification dans le stockage local
 */
export const setAuthToken = (token: string): void => {
  if (!token) {
    removeAuthToken();
    return;
  }
  
  localStorage.setItem(TOKEN_KEY, token);
  
  // Mettre à jour le timestamp du dernier accès
  localStorage.setItem('last_activity', Date.now().toString());
};

/**
 * Supprime le token d'authentification du stockage local
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem('last_activity');
};

/**
 * Récupère le refresh token depuis le stockage local
 */
export const getRefreshToken = (): TokenType => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Définit le refresh token dans le stockage local
 */
export const setRefreshToken = (token: string): void => {
  if (!token) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }
  
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return isTokenValid(token);
};

/**
 * Déconnecte l'utilisateur et redirige vers la page de connexion
 */
export const logout = (redirectToLogin: boolean = true): void => {
  const authStore = useAuthStore();
  
  // Appeler la méthode de déconnexion du store
  authStore.logout();
  
  // Rediriger vers la page de connexion si demandé
  if (redirectToLogin) {
    const router = useRouter();
    router.push({ 
      name: 'login',
      query: { 
        redirect: router.currentRoute.value.fullPath,
        session: 'expired'
      } 
    });
  }
};

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export const hasRole = (requiredRole: string): boolean => {
  const authStore = useAuthStore();
  const user = authStore.user;
  
  if (!user || !user.userType) return false;
  
  // Normaliser les rôles pour la comparaison
  const userRole = user.userType.toString().toLowerCase().trim();
  const normalizedRequiredRole = requiredRole.toString().toLowerCase().trim();
  
  return userRole === normalizedRequiredRole;
};

/**
 * Vérifie si l'utilisateur a l'une des autorisations requises
 */
export const hasAnyRole = (requiredRoles: string[]): boolean => {
  return requiredRoles.some(role => hasRole(role));
};

/**
 * Décode un token JWT
 */
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

/**
 * Récupère les données de l'utilisateur à partir du token
 */
export const getUserFromToken = (token: string): any => {
  const decoded = decodeToken(token);
  return decoded?.user || null;
};

/**
 * Vérifie si le token est sur le point d'expirer
 * @param token Le token à vérifier (optionnel, si non fourni utilise getAuthToken())
 * @param minutes Le nombre de minutes avant l'expiration pour déclencher le rafraîchissement (défaut: 5)
 * @returns boolean Vrai si le token expire bientôt
 */
export const isTokenExpiringSoon = (token?: string, minutes: number = 5): boolean => {
  const tokenToCheck = token || getAuthToken();
  if (!tokenToCheck) return true;
  
  try {
    const decoded = decodeToken(tokenToCheck);
    if (!decoded?.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const thresholdInSeconds = minutes * 60;
    
    return (decoded.exp - currentTime) < thresholdInSeconds;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'expiration du token:', error);
    return true; // En cas d'erreur, considérer le token comme expiré
  }
};

/**
 * Sauvegarde les informations utilisateur dans le stockage local
 */
export const saveUserData = (userData: any): void => {
  if (!userData) {
    localStorage.removeItem(USER_DATA_KEY);
    return;
  }
  
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

/**
 * Récupère les informations utilisateur depuis le stockage local
 */
export const getUserData = (): any => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Initialise l'authentification au chargement de l'application
 */
export const initAuth = async (): Promise<boolean> => {
  const token = getAuthToken();
  
  // Si pas de token, l'utilisateur n'est pas authentifié
  if (!token) {
    return false;
  }
  
  // Vérifier si le token est toujours valide
  if (!isTokenValid(token)) {
    // Essayer de rafraîchir le token s'il est expiré
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        // Implémenter la logique de rafraîchissement du token ici
        // const response = await authService.refreshToken(refreshToken);
        // if (response.token) {
        //   setAuthToken(response.token);
        //   return true;
        // }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error);
        return false;
      }
    }
    
    // Si le rafraîchissement échoue ou n'est pas possible
    removeAuthToken();
    return false;
  }
  
  return true;
};

/**
 * Gestionnaire d'événements tactiles pour éviter les erreurs de cancellation
 * @param event L'événement tactile
 * @param callback La fonction à exécuter si l'événement est cancelable
 */
export const handleTouchEvent = (event: TouchEvent, callback?: () => void): void => {
  // Vérifier si l'événement est cancelable avant d'essayer de l'empêcher
  if (event.cancelable) {
    event.preventDefault();
    if (callback) {
      callback();
    }
  } else {
    // Si l'événement n'est pas cancelable, ne pas essayer de l'empêcher
    // Cela évite les erreurs "cancelable=false"
    if (callback) {
      callback();
    }
  }
};

/**
 * Configure les gestionnaires d'événements tactiles pour éviter les erreurs
 */
export const setupTouchEventHandlers = (): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleTouchMove = (event: TouchEvent) => {
    // Ne pas empêcher les événements touchmove pendant le défilement
    // Cela évite les erreurs "cancelable=false"
    if (!event.cancelable) {
      return;
    }
  };

  const handleTouchStart = (event: TouchEvent) => {
    // Gestionnaire pour touchstart si nécessaire
    if (!event.cancelable) {
      return;
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    // Gestionnaire pour touchend si nécessaire
    if (!event.cancelable) {
      return;
    }
  };

  // Ajouter les écouteurs avec passive: true pour éviter les erreurs
  window.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
  window.addEventListener('touchmove', handleTouchMove as EventListener, { passive: true });
  window.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });

  // Retourner la fonction de nettoyage
  return () => {
    window.removeEventListener('touchstart', handleTouchStart as EventListener);
    window.removeEventListener('touchmove', handleTouchMove as EventListener);
    window.removeEventListener('touchend', handleTouchEnd as EventListener);
  };
};
