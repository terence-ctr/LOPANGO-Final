import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

// Clés de stockage
const TOKEN_KEY = 'lopango_auth_token';
const REFRESH_TOKEN_KEY = 'lopango_refresh_token';
const USER_DATA_KEY = 'lopango_user_data';

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
 * Vérifie si le token est sur le point d'expirer (dans les 5 minutes)
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutesInSeconds = 5 * 60;
    
    return (decoded.exp - currentTime) < fiveMinutesInSeconds;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'expiration du token:', error);
    return true;
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
