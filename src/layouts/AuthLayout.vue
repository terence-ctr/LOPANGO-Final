<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { routeConfig, getDefaultRouteForRole } from '@/config/routes';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const currentYear = new Date().getFullYear();
const isLoading = ref(false);
const error = ref<string | null>(null);

// Récupérer les informations de la page en cours
const pageInfo = computed(() => {
  const routeName = route.name?.toString() || '';
  return routeConfig[routeName] || { title: 'Connexion', subtitle: 'Accédez à votre compte' };
});

// Rediriger vers le tableau de bord si déjà connecté
const checkAuthStatus = () => {
  if (authStore.isAuthenticated) {
    const userRole = authStore.user?.role;
    if (userRole) {
      const redirectTo = getDefaultRouteForRole(userRole);
      // Utiliser replace pour éviter d'ajouter une entrée dans l'historique
      router.replace(redirectTo);
    }
  }
};

// Gestion du défilement fluide
const handleSmoothScroll = (e: Event) => {
  if ((e.target as HTMLElement).tagName === 'A' && (e.target as HTMLAnchorElement).hash) {
    e.preventDefault();
    const targetId = (e.target as HTMLAnchorElement).hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

// Gestion des changements de route
watch(() => route.name, (newRouteName) => {
  if (!newRouteName) return;
  
  // Vérifier l'authentification
  checkAuthStatus();
  
  // Mettre à jour le titre de la page
  const title = pageInfo.value.title;
  document.title = `${title} | Lopango`;
  
  // Défiler en haut de la page
  window.scrollTo(0, 0);
}, { immediate: true });

// Gestion des erreurs globales
const handleGlobalError = (event: ErrorEvent) => {
  console.error('Erreur globale:', event.error);
  error.value = 'Une erreur est survenue. Veuillez réessayer.';
  isLoading.value = false;
};

// Gestion des promesses non attrapées
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Promesse rejetée non gérée:', event.reason);
  error.value = event.reason?.message || 'Une erreur est survenue avec une opération asynchrone.';
  isLoading.value = false;
};

// Configuration initiale
onMounted(() => {
  checkAuthStatus();
  document.addEventListener('click', handleSmoothScroll);
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
});

// Nettoyage
onUnmounted(() => {
  document.removeEventListener('click', handleSmoothScroll);
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
});
</script>

<template>
  <div class="min-h-screen">
    <!-- En-tête -->
  

    <!-- Contenu principal -->
    <main class="flex-grow bg-white-700 flex items-center justify-center">
      <div class="w-full bg-white space-y-8">
        <!-- Message d'erreur global -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

       
        <!-- Messages flash -->
        <div v-if="route.query.verified" class="rounded-md bg-green-50">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">
                Votre compte a été vérifié avec succès. Vous pouvez maintenant vous connecter.
              </p>
            </div>
          </div>
        </div>

        <!-- Contenu du formulaire -->
        <div class="bg-white">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>

  
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>