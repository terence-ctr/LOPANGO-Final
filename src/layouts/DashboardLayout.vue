<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Contenu principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Barre de navigation supérieure -->
     <TopNavigationBar
        :user="authStore.user"
        :pageTitle="route.meta.title || 'Tableau de bord'"
        @toggleSidebar="toggleSidebar"
        @logout="logout"
      />  

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
import TopNavigationBar from '@/components/layout/TopNavigationBar.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const isProfileMenuOpen = ref(false);
const isSidebarOpen = ref(false);

// Initiales de l'utilisateur pour l'avatar
const userInitials = computed(() => {
  if (!authStore.user) return '??';
  const firstName = authStore.user.firstName || '';
  const lastName = authStore.user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  if (!fullName) return '??';
  return fullName
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
