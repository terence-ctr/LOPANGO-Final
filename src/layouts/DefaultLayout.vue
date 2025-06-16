<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { routeConfig, getDefaultRouteForRole, hasAccessToRoute } from '@/config/routes';
import Sidebar from '@/components/layout/Sidebar.vue';
import DashboardHeader from '@/components/layout/DashboardHeader.vue';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const isSidebarOpen = ref(true);
const isMobile = ref(false);

// Vérification de l'authentification
const checkAuth = async () => {
  if (!authStore.isAuthenticated) {
    try {
      const isAuthenticated = await authStore.checkAuth();
      if (!isAuthenticated) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur de vérification d\'authentification:', error);
      router.push('/login');
    }
  }
};

// Vérification de l'authentification au chargement
onMounted(async () => {
  await checkAuth();
  
  // Gestion du responsive
  const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 1024;
    isSidebarOpen.value = window.innerWidth >= 1024;
  };
  
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
  
  return () => {
    window.removeEventListener('resize', checkScreenSize);
  };
});

// Basculer la sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// États
const isLoading = ref(false);
const error = ref<string | null>(null);

// Récupérer les informations de la page en cours
const pageInfo = computed(() => {
  const routeName = route.name?.toString() || '';
  return routeConfig[routeName] || { title: 'Tableau de bord', subtitle: '' };
});

const pageTitle = computed(() => pageInfo.value.title);
const pageSubtitle = computed(() => pageInfo.value.subtitle);

// Vérifier les autorisations d'accès
const checkAccess = () => {
  const routeName = route.name?.toString();
  if (!routeName) return;

  const userRole = authStore.user?.role;
  const hasAccess = hasAccessToRoute(routeName, userRole);

  if (!hasAccess) {
    // Rediriger vers la page de connexion ou le tableau de bord approprié
    const redirectTo = authStore.isAuthenticated 
      ? getDefaultRouteForRole(userRole)
      : '/login';
    
    // Si on est déjà sur la page de redirection, éviter la boucle infinie
    if (route.path !== redirectTo) {
      router.push(redirectTo);
    }
  }
};

// Gestion des changements de route
watch(() => route.name, (newRouteName) => {
  if (!newRouteName) return;
  
  // Réinitialiser les états
  error.value = null;
  
  // Vérifier les autorisations
  checkAccess();
  
  // Déclencher le chargement
  isLoading.value = true;
  
  // Défiler en haut de la page
  window.scrollTo(0, 0);
  
  // Mettre à jour le titre de la page
  const title = routeConfig[newRouteName]?.title || 'Tableau de bord';
  document.title = `${title} | Lopango`;
}, { immediate: true });

// Gestion des transitions de page
const onBeforePageChange = () => {
  isLoading.value = true;
};

const onAfterPageChange = () => {
  isLoading.value = false;
};

const onSuspenseFallback = () => {
  isLoading.value = true;
};

const onSuspenseResolve = () => {
  isLoading.value = false;
};

// Vérifier les autorisations au montage du composant
onMounted(() => {
  checkAccess();
  
  // Écouter les erreurs globales
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Erreur non gérée:', event.reason);
    error.value = 'Une erreur est survenue. Veuillez réessayer plus tard.';
    isLoading.value = false;
  });
});

</script>

<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <Sidebar v-if="authStore.isAuthenticated" class="fixed inset-y-0 left-0 z-30" />
    
    <!-- Main Content -->
    <div 
      class="flex-1 flex flex-col min-h-screen transition-all duration-300"
      :class="{ 'lg:ml-64': authStore.isAuthenticated }"
    >
      <!-- Top Navigation -->
      <header class="bg-white shadow-sm z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <button 
                v-if="authStore.isAuthenticated"
                @click="toggleSidebar" 
                class="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <span class="sr-only">Ouvrir le menu</span>
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 class="text-lg font-semibold text-gray-900 ml-2">{{ pageTitle }}</h1>
            </div>
            
            <!-- User Dropdown -->
            <div class="flex items-center">
              <div class="ml-4 relative" v-if="authStore.isAuthenticated">
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenu principal -->
      <main class="flex-1 flex flex-col min-h-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
          <router-view v-slot="{ Component, route: currentRoute }">
            <transition 
              name="fade" 
              mode="out-in"
              @before-enter="onBeforePageChange"
              @after-enter="onAfterPageChange"
            >
              <suspense @resolve="onSuspenseResolve" @fallback="onSuspenseFallback">
                <component 
                  :is="Component" 
                  :key="currentRoute.fullPath"
                  v-bind="currentRoute.meta.componentProps || {}"
                />
              </suspense>
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Style pour le focus visible */
main:focus {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
</style>