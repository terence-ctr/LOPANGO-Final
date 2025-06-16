<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Contenu principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Barre de navigation supérieure -->
      <header class="bg-white shadow-sm z-10">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <!-- Bouton pour afficher/masquer la sidebar (mobile) -->
          <button 
            @click="toggleSidebar"
            class="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            aria-label="Ouvrir le menu"
          >
            <font-awesome-icon :icon="['fas', 'bars']" class="h-6 w-6" />
          </button>
          
          <!-- Titre de la page -->
          <h1 class="text-lg font-medium text-gray-900">
            {{ route.meta.title || 'Tableau de bord' }}
          </h1>
          
          <!-- Menu utilisateur -->
          <div class="flex items-center space-x-4">
            <div class="relative">
              <button 
                @click="toggleProfileMenu" 
                class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Menu utilisateur"
              >
                <span class="sr-only">Ouvrir le menu utilisateur</span>
                <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {{ userInitials }}
                </div>
              </button>
              
              <!-- Menu déroulant utilisateur -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div 
                  v-show="isProfileMenuOpen" 
                  v-click-outside="() => isProfileMenuOpen = false"
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <router-link 
                    to="/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    @click="isProfileMenuOpen = false"
                  >
                    <font-awesome-icon :icon="['fas', 'user']" class="mr-2" />
                    Mon profil
                  </router-link>
                  <button 
                    @click="logout"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    role="menuitem"
                  >
                    <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="mr-2" />
                    Déconnexion
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenu de la page -->
      <main class="flex-1 overflow-y-auto focus:outline-none bg-gray-50">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <router-view v-slot="{ Component }">
              <transition
                enter-active-class="transition-opacity ease-linear duration-200"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition-opacity ease-linear duration-200"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Sidebar from '@/components/Sidebar.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const isProfileMenuOpen = ref(false);
const isSidebarOpen = ref(false);

// Initiales de l'utilisateur pour l'avatar
const userInitials = computed(() => {
  if (!authStore.user) return '??';
  const name = authStore.user.name || '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

// Basculer la visibilité de la sidebar (mobile)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  // Émettre un événement personnalisé pour informer le composant Sidebar
  document.dispatchEvent(new CustomEvent('toggle-sidebar', { detail: isSidebarOpen.value }));
};

// Gérer le clic en dehors du menu utilisateur
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-menu') && isProfileMenuOpen.value) {
    isProfileMenuOpen.value = false;
  }
};

// Déconnexion
const logout = async () => {
  isProfileMenuOpen.value = false;
  await authStore.logout();
  router.push('/login');
};

// Gérer le redimensionnement de la fenêtre
const handleResize = () => {
  if (window.innerWidth >= 768) {
    isSidebarOpen.value = false;
  }
};

// Ajouter les écouteurs d'événements
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResize);
  
  // Fermer la sidebar au chargement initial sur mobile
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false;
  }
});

// Nettoyer les écouteurs d'événements
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Transition pour les menus déroulants */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Styles pour le contenu principal */
main {
  scroll-behavior: smooth;
}

/* Ajustements pour les écrans mobiles */
@media (max-width: 767px) {
  .sidebar-collapsed {
    transform: translateX(-100%);
  }
  
  .sidebar-expanded {
    transform: translateX(0);
  }
}
</style>
