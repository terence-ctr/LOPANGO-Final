<template>
  <!-- Écran de chargement initial -->
  <div v-if="isInitializing" class="fixed inset-0 bg-white flex items-center justify-center z-50">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="mt-4 text-gray-600 font-medium">Chargement de l'application...</p>
    </div>
  </div>

  <!-- Contenu principal -->
  <div v-else class="min-h-screen flex flex-col">
    <!-- Bannière de maintenance -->
    <div v-if="isMaintenanceMode" class="bg-yellow-500 text-white text-center py-2 px-4">
      <p class="text-sm font-medium">
        🚧 Maintenance prévue aujourd'hui de 2h à 4h du matin. Désolé pour la gêne occasionnée.
      </p>
    </div>

    <!-- Contenu de l'application -->
    <router-view v-slot="{ Component, route }">
      <transition
        :name="route.meta.transition || 'fade'"
        mode="out-in"
        @before-enter="onBeforePageChange"
        @after-enter="onAfterPageChange"
      >
        <suspense @pending="onSuspensePending" @resolve="onSuspenseResolve">
          <div>
            <component :is="Component" :key="route.path" />
          </div>
          
          <!-- État de chargement des composants asynchrones -->
          <template #fallback>
            <div class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-40">
              <div class="text-center">
                <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p class="mt-3 text-gray-600">Chargement en cours...</p>
              </div>
            </div>
          </template>
        </suspense>
      </transition>
    </router-view>

    <!-- Bannière de cookies -->
    <div v-if="showCookieBanner" class="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-40">
      <div class="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <p class="text-sm mb-4 md:mb-0 md:mr-4">
          🍪 Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre
          <router-link to="/politique-cookies" class="underline hover:text-blue-300">politique de cookies</router-link>.
        </p>
        <button 
          @click="acceptCookies"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors duration-150"
        >
          J'accepte
        </button>
      </div>
    </div>

    <!-- Bouton de retour en haut -->
    <button
      v-show="showScrollToTop"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-30"
      aria-label="Retour en haut de la page"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </div>

  <!-- Gestionnaire d'erreurs global -->
  <teleport to="body">
    <div v-if="globalError" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="ml-3 text-lg font-medium text-gray-900">Une erreur est survenue</h3>
        </div>
        <div class="mt-4">
          <p class="text-sm text-gray-600">{{ globalError }}</p>
          <div class="mt-5 sm:mt-6">
            <button
              type="button"
              @click="globalError = null"
              class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            >
              D'accord
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onErrorCaptured, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import 'vue3-toastify/dist/index.css';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// États
const isInitializing = ref(true);
const isMaintenanceMode = ref(false);
const showCookieBanner = ref(!localStorage.getItem('cookiesAccepted'));
const showScrollToTop = ref(false);
const globalError = ref<string | null>(null);

// Vérifier le mode maintenance
const checkMaintenanceMode = async () => {
  try {
    // Ici, vous pourriez faire un appel API pour vérifier le statut de maintenance
    // const response = await fetch('/api/maintenance');
    // isMaintenanceMode.value = response.data.maintenance;
    
    // Pour l'instant, on utilise une valeur statique
    isMaintenanceMode.value = false;
    
    if (isMaintenanceMode.value && route.name !== 'maintenance') {
      router.push({ name: 'maintenance' });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du mode maintenance:', error);
  }
};

// Gestion des cookies
const acceptCookies = () => {
  localStorage.setItem('cookiesAccepted', 'true');
  showCookieBanner.value = false;
};

// Gestion du défilement
const handleScroll = () => {
  showScrollToTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Gestion des transitions de page
const onBeforePageChange = () => {
  // Actions avant le changement de page
};

const onAfterPageChange = () => {
  // Actions après le changement de page
  window.scrollTo(0, 0);
};

// Gestion des états de chargement avec Suspense
const onSuspensePending = () => {
  // Début du chargement asynchrone
};

const onSuspenseResolve = () => {
  // Fin du chargement asynchrone
};

// Gestion des erreurs globales
const handleGlobalError = (event: ErrorEvent) => {
  console.error('Erreur globale:', event.error);
  globalError.value = 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.';
  event.preventDefault();
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Promesse rejetée non gérée:', event.reason);
  globalError.value = event.reason?.message || 'Une erreur est survenue avec une opération asynchrone.';
  event.preventDefault();
};

// Capturer les erreurs des composants
onErrorCaptured((err: Error) => {
  console.error('Erreur capturée par onErrorCaptured:', err);
  globalError.value = err.message || 'Une erreur est survenue dans le composant.';
  // Empêcher la propagation de l'erreur
  return false;
});

// Initialisation
const initializeApp = async () => {
  try {
    console.log('Initialisation de l\'application...');
    
    // 1. Vérifier le mode maintenance
    console.log('Vérification du mode maintenance...');
    await checkMaintenanceMode();
    
    if (isMaintenanceMode.value) {
      console.log('Mode maintenance activé');
      return;
    }
    
    // 2. Vérifier l'authentification (sans bloquer l'interface)
    console.log('Vérification de l\'authentification...');
    
    // Ne pas attendre la vérification d'authentification pour afficher l'interface
    // Cela permet d'éviter un écran blanc en cas de problème de connexion
    const authCheck = authStore.checkAuth()
      .then(() => {
        console.log('Authentification vérifiée avec succès');
      })
      .catch(error => {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        // Ne pas afficher d'erreur pour les erreurs 401 (gérées dans le store)
        if (error.response?.status !== 401) {
          // Si l'erreur est liée à la vérification du token, on ne déconnecte pas l'utilisateur
          // pour éviter les déconnexions intempestives
          if (error.message?.includes('token') || error.message?.includes('authentification')) {
            console.warn('Erreur de vérification du token, mais on reste connecté');
            return;
          }
          globalError.value = 'Erreur de connexion au serveur. Veuillez rafraîchir la page.';
        }
      });
    
    // Attendre un court instant pour laisser le temps à l'authentification de se terminer
    // mais ne pas bloquer l'affichage de l'interface
    await Promise.race([
      authCheck,
      new Promise(resolve => setTimeout(resolve, 1000)) // Timeout de 1 seconde
    ]);
    
  } catch (error) {
    console.error('Erreur critique lors de l\'initialisation:', error);
    // Ne pas afficher d'erreur pour les erreurs 401 (gérées dans le store)
    if (error.response?.status !== 401) {
      globalError.value = 'Impossible de charger l\'application. Veuillez rafraîchir la page.';
    }
  } finally {
    console.log('Fin de l\'initialisation, masquage du loader...');
    // Masquer le loader même en cas d'erreur
    isInitializing.value = false;
  }
};

// Configuration initiale
onMounted(async () => {
  console.log('Montage du composant App');
  
  // Ajouter les écouteurs d'événements
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  
  try {
    // Démarrer l'initialisation
    await initializeApp();
  } catch (error) {
    console.error('Erreur critique lors de l\'initialisation:', error);
    isInitializing.value = false;
  }
});

// Nettoyage
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
});
</script>

<style>
/* Transitions de base */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animation de chargement personnalisée */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Styles pour le bouton de retour en haut */
.scroll-to-top-enter-active,
.scroll-to-top-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.scroll-to-top-enter-from,
.scroll-to-top-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Amélioration de l'accessibilité */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Styles pour les transitions de page */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>