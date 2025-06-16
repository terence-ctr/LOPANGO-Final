<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth';
import type { UserType } from '@/types/user.types';

const router = useRouter();
const authStore = useAuthStore();

interface LoginFormData {
  email: string;
  password: string;
  userType:UserType;
}

const formData = reactive<LoginFormData>({
  email: '',
  password: '',
  userType: 'tenant' as UserType // Valeur par défaut
});

const error = ref('');
const loading = ref(false);
const logoImage = ref('/src/assets/logoGood.png');

const login = async (event?: Event) => {
  // Empêcher le rechargement de la page si l'événement est présent
  if (event) {
    event.preventDefault();
  }
  
  try {
    loading.value = true;
    error.value = '';
    
    // Validation basique
    if (!formData.email || !formData.password || !formData.userType) {
      error.value = 'Veuillez remplir tous les champs';
      return;
    }

    console.log('Tentative de connexion avec:', formData.email);
    
    // Utiliser le store d'authentification pour la connexion
    console.log('Données de connexion:', { 
      email: formData.email, 
      hasPassword: !!formData.password,
      userType: formData.userType 
    });
    
    const success = await authStore.login({
      email: formData.email,
      password: formData.password,
      userType: formData.userType
    });
    
    console.log('Résultat de la connexion:', success);

    if (success) {
      console.log('Connexion réussie, redirection vers le dashboard');
      // Rediriger vers le tableau de bord approprié en utilisant le nom de la route
      const dashboardRoute = `${formData.userType}-dashboard`;
      console.log('Redirection vers la route:', dashboardRoute);
      router.push({ name: dashboardRoute });
    } else {
      // Récupérer le message d'erreur du store ou utiliser un message par défaut
      const errorMsg = authStore.error || 'Identifiants incorrects. Veuillez réessayer.';
      console.error('Erreur de connexion:', errorMsg);
      error.value = errorMsg;
    }
  } catch (err: any) {
    console.error('Erreur lors de la connexion dans le composant:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: err.config
    });
    
    // Si l'erreur a déjà été gérée par le store, on l'utilise
    if (authStore.error) {
      error.value = authStore.error;
      return;
    }
    
    // Sinon, on gère l'erreur localement
    if (err.response) {
      // Erreur de réponse du serveur (4xx, 5xx)
      if (err.response.status === 401) {
        error.value = 'Adresse e-mail ou mot de passe incorrect.';
      } else if (err.response.status >= 500) {
        error.value = 'Erreur serveur. Veuillez réessayer plus tard.';
      } else if (err.response.data?.message) {
        error.value = err.response.data.message;
      } else if (err.response.data?.error) {
        error.value = err.response.data.error;
      } else {
        error.value = `Erreur ${err.response.status}: ${err.response.statusText}`;
      }
    } else if (err.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      error.value = 'Pas de réponse du serveur. Vérifiez votre connexion internet.';
    } else if (err.message) {
      // Une erreur s'est produite lors de la configuration de la requête
      error.value = `Erreur: ${err.message}`;
    } else {
      error.value = 'Une erreur inconnue est survenue lors de la connexion.';
    }
  } finally {
    loading.value = false;
  }
};

// Vérifier si l'utilisateur est déjà connecté
onMounted(async () => {
  try {
    if (authService.isAuthenticated()) {
      const response = await authService.getCurrentUser();
      // Rediriger vers le tableau de bord approprié
      if (response?.data?.userType) {
        router.push(`/${response.data.userType}/dashboard`);
      } else {
        // Si le type d'utilisateur n'est pas défini, rediriger vers la page de connexion
        router.push('/login');
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    // En cas d'erreur, déconnecter l'utilisateur et rediriger vers la page de connexion
    await authService.logout();
    router.push('/login');
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-white">
    <!-- Partie image -->
    <div class="hidden md:flex md:w-1/2 relative">
      <div class="max-w-md">
        <img :src="logoImage" alt="Logo" class="hidden mt-[120px] mb-[20px] ml-[20px] md:flex items-center justify-center relative"/>
      </div>
    </div>
    
    <!-- Partie formulaire -->
    <div class="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-800">Connexion</h2>
          <p class="mt-2 text-sm text-gray-600">Entrez vos identifiants pour accéder à votre compte</p>
        </div>

        <form @submit="login" class="space-y-6">
          <!-- Message d'erreur -->
          <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>
          <!-- Champ email -->
          <div class="space-y-2">
            <label for="email-address" class="block text-sm font-medium text-gray-700">Adresse email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email-address"
                v-model="formData.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <!-- Champ mot de passe -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
              <router-link 
                to="/auth/forgot-password" 
                class="text-sm text-blue-600 hover:text-blue-500 hover:underline"
              >
                Mot de passe oublié ?
              </router-link>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                id="password"
                v-model="formData.password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Votre mot de passe"
              />
            </div>
          </div>

          <!-- Sélecteur de type d'utilisateur -->
          <div class="space-y-2">
            <label for="userType" class="block text-sm font-medium text-gray-700">Type de compte</label>
            <div class="relative">
              <select
                id="userType"
                v-model="formData.userType"
                name="userType"
                required
                class="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none"
              >
                <option value="" disabled selected>Sélectionnez un type de compte</option>
                <option value="tenant">Locataire</option>
                <option value="landlord">Propriétaire</option>
                <option value="agent">Agent immobilier</option>
                <option value="admin">Administrateur</option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <!-- Bouton de connexion -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              :class="{ 'opacity-70 cursor-not-allowed': loading }"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
            </button>
          </div>

          <!-- Lien d'inscription -->
          <div class="text-center text-sm text-gray-600 mt-6">
            <p>Vous n'avez pas de compte ?
              <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
                Créer un compte
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
  
  body {
    font-family: 'Inter', sans-serif;
  }
  
  /* Animation de chargement du bouton */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  /* Style personnalisé pour le select */
  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 0.7rem top 50%;
    background-size: 0.65em auto, 100%;
  }
  
  /* Styles pour le mode sombre */
  @media (prefers-color-scheme: dark) {
    .dark\:bg-gray-800 {
      background-color: #1f2937;
    }
    .dark\:text-white {
      color: #fff;
    }
    .dark\:border-gray-700 {
      border-color: #374151;
    }
  }
</style>