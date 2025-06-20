import { AppError } from '@/types/error.types';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

/**
 * Gestionnaire d'erreurs centralisé pour l'application
 */
class ErrorHandler {
  /**
   * Traite une erreur et retourne un message utilisateur approprié
   * @param error - L'erreur à traiter
   * @returns Un objet contenant le message d'erreur et le code de statut
   */
  public static handleError(error: unknown): { message: string; status?: number } {
    console.error('Erreur interceptée:', error);
    
    // Si c'est une instance de notre AppError personnalisée
    if (error instanceof AppError) {
      return {
        message: error.message,
        status: error.statusCode
      };
    }
    
    // Erreur Axios
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosError = error as any;
      
      // Gestion des erreurs d'authentification
      if (axiosError.response?.status === 401) {
        const authStore = useAuthStore();
        authStore.logout();
        router.push({ name: 'login' });
        return {
          message: 'Votre session a expiré. Veuillez vous reconnecter.',
          status: 401
        };
      }
      
      // Erreur de validation
      if (axiosError.response?.status === 422) {
        const errors = axiosError.response?.data?.errors;
        if (errors) {
          return {
            message: 'Des erreurs de validation sont survenues',
            status: 422,
            errors
          };
        }
      }
      
      // Autres erreurs HTTP
      if (axiosError.response?.data?.message) {
        return {
          message: axiosError.response.data.message,
          status: axiosError.response.status
        };
      }
    }
    
    // Erreur réseau
    if (error instanceof Error && error.message === 'Network Error') {
      return {
        message: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.',
        status: 0
      };
    }
    
    // Erreur inconnue
    return {
      message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
      status: 500
    };
  }
  
  /**
   * Crée un gestionnaire d'erreur pour les promesses non attrapées
   */
  public static setupGlobalErrorHandling() {
    // Gestion des erreurs non attrapées dans les promesses
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      const { message } = this.handleError(error);
      console.error('Erreur non gérée dans une promesse:', message);
    });
    
    // Gestion des erreurs globales
    window.onerror = (message, source, lineno, colno, error) => {
      const { message: errorMessage } = this.handleError(error || new Error(String(message)));
      console.error('Erreur globale:', errorMessage);
      return false; // Empêche le comportement par défaut du navigateur
    };
  }
}

export default ErrorHandler;
