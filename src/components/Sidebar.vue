<template>
  <aside 
    class="bg-blue-800 text-white w-64 min-h-screen flex flex-col transition-all duration-300 ease-in-out relative z-30" 
    :class="{ 'w-20': isCollapsed }"
  >
    <!-- Logo et bouton de repli -->
    <div class="p-4 flex items-center justify-between relative">
      <transition name="fade" mode="out-in">
        <div v-if="!isCollapsed" class="flex items-center gap-2">
          <img src="@/assets/lopangologo.png" alt="Logo LOPANGO" class="w-12 h-12" />
          <span class="text-xl font-bold whitespace-nowrap">LOPANGO</span>
        </div>
        <div v-else class="flex justify-center w-full">
          <img src="@/assets/lopangologo.png" alt="Logo" class="w-10 h-10" />
        </div>
      </transition>
      <!-- Bouton de toggle amélioré -->
     
    </div>
    
    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4 overflow-y-auto" aria-label="Navigation principale">
      <!-- Admin Menu -->
      <div v-if="userType === 'admin'" class="space-y-1">
        <NavItem 
          v-for="item in adminMenu" 
          :key="item.to"
          :item="item"
          :is-collapsed="isCollapsed"
          :is-active="isActive(item.to)"
        />
      </div>

      <!-- Agent Menu -->
      <div v-else-if="userType === 'agent'" class="space-y-1">
        <NavItem 
          v-for="item in agentMenu" 
          :key="item.to"
          :item="item"
          :is-collapsed="isCollapsed"
          :is-active="isActive(item.to)"
        />
      </div>

      <!-- Tenant Menu -->
      <div v-else-if="userType === 'tenant'" class="space-y-1">
        <NavItem 
          v-for="item in tenantMenu" 
          :key="item.to"
          :item="item"
          :is-collapsed="isCollapsed"
          :is-active="isActive(item.to)"
        />
      </div>

      <!-- Landlord Menu -->
      <div v-else-if="userType === 'landlord'" class="space-y-1">
        <NavItem 
          v-for="item in landlordMenu" 
          :key="item.to"
          :item="item"
          :is-collapsed="isCollapsed"
          :is-active="isActive(item.to)"
        />
      </div>
    </nav>

    <!-- User Info & Logout -->
    <div class="p-4 border-t border-blue-700">
      <div class="flex items-center gap-3 mb-4">
        <div 
          class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0"
          :class="{ 'w-10 h-10': !isCollapsed, 'w-8 h-8 mx-auto': isCollapsed }"
        >
          {{ userInitials }}
        </div>
        <transition name="fade" mode="out-in">
          <div v-if="!isCollapsed" class="min-w-0">
            <p class="font-medium truncate text-blue-200"> {{ userName }}</p>
            <p class="text-sm text-blue-200 truncate">{{ userRole }}</p>
          </div>
        </transition>
      </div>
      <button 
        @click="logout" 
        class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-700 transition-colors"
        :class="{ 'justify-center': isCollapsed }"
        aria-label="Se déconnecter"
      >
        <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="text-lg" />
        <transition name="fade" mode="out-in">
          <span v-if="!isCollapsed">Déconnexion</span>
        </transition>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import NavItem from './NavItem.vue';

// Menu configuration
const adminMenu = [
  { to: '/admin/dashboard', icon: 'chart-pie', label: 'Tableau de bord' },
  { to: '/admin/properties', icon: 'building', label: 'Mes propriétés' },
  { to: '/admin/contracts', icon: 'file-contract', label: 'Mes contrats' },
  { to: '/admin/payments', icon: 'credit-card', label: 'Paiements' },
  { to: '/admin/users', icon: 'users', label: 'Utilisateurs' },
  { to: '/admin/tenants', icon: 'user-tie', label: 'Locataires' },
  { to: '/admin/landlords', icon: 'user-shield', label: 'Propriétaires' },
  { to: '/admin/agents', icon: 'user-tag', label: 'Agents' },
  { to: '/admin/taxes', icon: 'receipt', label: 'Taxes' },
  { to: '/admin/reports', icon: 'chart-bar', label: 'Rapports' },
  { to: '/admin/settings', icon: 'cog', label: 'Paramètres' },
];

const agentMenu = [
  { to: '/agent/dashboard', icon: 'chart-pie', label: 'Tableau de bord' },
  { to: '/agent/properties', icon: 'home', label: 'Propriétés' },
  { to: '/agent/contracts', icon: 'file-contract', label: 'Contrats' },
  { to: '/agent/clients', icon: 'users', label: 'Clients' },
  { to: '/agent/payments', label: 'Paiements', icon: ['fas', 'money-bill'] },
  { to: '/agent/visits', icon: 'calendar-check', label: 'Visites' },
  { to: '/agent/commission', icon: 'percentage', label: 'Commissions' },
  { to: '/agent/messages', icon: 'envelope', label: 'Messages' },
  { to: '/agent/reports', icon: 'chart-line', label: 'Rapports' },
];

const tenantMenu = [
  { to: '/tenant/dashboard', icon: 'chart-pie', label: 'Tableau de bord' },
  { to: '/tenant/contracts', icon: 'file-contract', label: 'Mes contrats' },
  { to: '/tenant/properties', icon: 'home', label: 'Mon logement' },
  { to: '/tenant/payments', icon: 'credit-card', label: 'Paiements' },
  { to: '/tenant/maintenance', icon: 'tools', label: 'Maintenance' },
  { to: '/tenant/documents', icon: 'folder', label: 'Documents' },
  { to: '/tenant/messages', icon: 'envelope', label: 'Messages' },
  { to: '/tenant/settings', icon: 'cog', label: 'Paramètres' },
];

const landlordMenu = [
  { to: '/landlord/dashboard', icon: 'chart-pie', label: 'Tableau de bord' },
  { to: '/landlord/properties', icon: 'building', label: 'Mes propriétés' },
  { to: '/landlord/tenants', icon: 'users', label: 'Locataires' },
  { to: '/landlord/contracts', icon: 'file-contract', label: 'Contrats' },
  { to: '/landlord/payments', icon: 'money-bill-wave', label: 'Paiements' },
 ];

const route = useRoute();
const authStore = useAuthStore();
const isCollapsed = ref(false);

// Utiliser directement le userType du store qui est déjà en minuscules
const userType = computed(() => authStore.userType);

// Afficher les données de l'utilisateur pour le débogage
// Propriétés réactives pour le nom et les initiales
const userName = computed(() => {
  const user = authStore.user;
  
  if (!user) {
    return 'Utilisateur';
  }
  
  // Construire le nom complet
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  
  // Fallback sur l'email
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'Utilisateur';
});

// Mettre à jour les initiales pour utiliser le même format de nom
const userInitials = computed(() => {
  const name = userName.value || '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});
const userRole = computed(() => {
  const roles: Record<string, string> = {
    admin: 'Administrateur',
    agent: 'Agent immobilier',
    tenant: 'Locataire',
    landlord: 'Propriétaire'
  };
  return roles[userType.value] || '';
});

// Methods
const isActive = (path: string) => route.path.startsWith(path);
const toggleSidebar = () => isCollapsed.value = !isCollapsed.value;
const logout = () => authStore.logout();
</script>

<style scoped>
/* Smooth transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Animation de rotation pour le bouton de la sidebar */
.rotate-90 {
  transform: rotate(90deg);
}

/* Styles pour le bouton de la sidebar */
button[aria-label*="menu"] {
  transition: all 0.3s ease;
}

button[aria-label*="menu"]:hover {
  transform: scale(1.1);
}

button[aria-label*="menu"]:active {
  transform: scale(0.95);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}

/* Collapsed state styles */
:deep(.nav-item) {
  transition: all 0.2s ease;
}

:deep(.nav-item.collapsed) {
  justify-content: center;
  padding: 0.75rem 0;
}

:deep(.nav-item.collapsed .nav-text) {
  display: none;
}
</style>
