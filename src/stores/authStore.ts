import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface User {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;  // Ajout du numéro de téléphone optionnel
  avatar?: string;
  userType?: 'landlord' | 'tenant' | 'agent' | 'admin';
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Méthode pour se connecter
  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      // Ici, vous devriez appeler votre API d'authentification
      // const response = await api.post('/auth/login', { email, password });
      // user.value = response.data.user;
      // isAuthenticated.value = true;
      
      // Simulation de connexion réussie pour le développement
      user.value = {
        id: 1,
        firstName: 'Prénom',
        lastName: 'Nom',
        email: email,
        userType: 'landlord',
        avatar: 'https://ui-avatars.com/api/?name=Prénom+Nom'
      };
      isAuthenticated.value = true;
      
      return true;
    } catch (err) {
      error.value = 'Échec de la connexion. Veuillez vérifier vos identifiants.';
      console.error('Erreur de connexion:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Méthode pour se déconnecter
  const logout = async () => {
    try {
      // Ici, vous devriez appeler votre API de déconnexion
      // await api.post('/auth/logout');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      user.value = null;
      isAuthenticated.value = false;
    }
  };

  // Vérifier l'état d'authentification au chargement
  const checkAuth = async () => {
    try {
      // Ici, vous devriez vérifier le token JWT ou la session
      // const response = await api.get('/auth/me');
      // user.value = response.data.user;
      // isAuthenticated.value = true;
      
      // Simulation d'utilisateur connecté pour le développement
      user.value = {
        id: 1,
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'exemple@email.com',
        userType: 'landlord',
        avatar: 'https://ui-avatars.com/api/?name=Prénom+Nom'
      };
      isAuthenticated.value = true;
      
      return true;
    } catch (err) {
      user.value = null;
      isAuthenticated.value = false;
      return false;
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkAuth,
  };
});
