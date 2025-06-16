<template>
  <aside class="bg-blue-800 text-white w-64 min-h-screen flex flex-col">
    <div class="p-6">
      <div class="flex items-center gap-2">
        <img src="@/assets/lopangologo.png" alt="Logo" class="w-24 h-24" />
      </div>
    </div>
    
    <nav class="flex-1 px-4">
      <!-- Admin Menu -->
      <div v-if="userType === 'admin'" class="space-y-2">
        <router-link 
          v-for="item in adminMenu" 
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          :class="{ 'bg-blue-700': isActive(item.to) }"
        >
          <font-awesome-icon :icon="item.icon" class="text-lg" />
          <span>{{ item.title }}</span>
        </router-link>
      </div>

      <!-- Agent Menu -->
      <div v-else-if="userType === 'agent'" class="space-y-2">
        <router-link 
          v-for="item in agentMenu" 
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          :class="{ 'bg-blue-700': isActive(item.to) }"
        >
          <font-awesome-icon :icon="item.icon" class="text-lg" />
          <span>{{ item.title }}</span>
        </router-link>
      </div>

      <!-- Tenant Menu -->
      <div v-else-if="userType === 'tenant'" class="space-y-2">
        <router-link 
          v-for="item in tenantMenu" 
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          :class="{ 'bg-blue-700': isActive(item.to) }"
        >
          <font-awesome-icon :icon="item.icon" class="text-lg" />
          <span>{{ item.title }}</span>
        </router-link>
      </div>

      <!-- Landlord Menu -->
      <div v-else-if="userType === 'landlord'" class="space-y-2">
        <router-link 
          v-for="item in landlordMenu" 
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          :class="{ 'bg-blue-700': isActive(item.to) }"
        >
          <font-awesome-icon :icon="item.icon" class="text-lg" />
          <span>{{ item.title }}</span>
        </router-link>
      </div>
    </nav>

    <div class="p-4 mt-auto border-t border-blue-700">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          {{ userInitials }}
        </div>
        <div>
          <p class="font-medium">{{ userName }}</p>
          <p class="text-sm text-blue-200">{{ userRoleLabel }}</p>
        </div>
      </div>
      <button 
        @click="logout" 
        class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="text-lg" />
        <span>Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Menus
const adminMenu = [
  { to: '/admin/dashboard', title: 'Tableau de bord', icon: ['fas', 'chart-line'] },
  { to: '/admin/properties', title: 'Propriétés', icon: ['fas', 'building'] },
  { to: '/admin/contracts', title: 'Contrats', icon: ['fas', 'file-contract'] },
  { to: '/admin/payments', title: 'Paiements', icon: ['fas', 'money-bill'] },
  { to: '/admin/tenants', title: 'Locataires', icon: ['fas', 'users'] },
  { to: '/admin/taxes', title: 'Taxes', icon: ['fas', 'receipt'] },
  { to: '/admin/complaints', title: 'Plaintes', icon: ['fas', 'exclamation-circle'] },
];

const agentMenu = [
  { to: '/agent/dashboard', title: 'Tableau de bord', icon: ['fas', 'chart-line'] },
  { to: '/agent/properties', title: 'Propriétés', icon: ['fas', 'building'] },
  { to: '/agent/contracts', title: 'Contrats', icon: ['fas', 'file-contract'] },
  { to: '/agent/clients', title: 'Clients', icon: ['fas', 'users'] },
  { to: '/agent/commission', title: 'Commission', icon: ['fas', 'percentage'] },
];

const tenantMenu = [
  { to: '/tenant/dashboard', title: 'Tableau de bord', icon: ['fas', 'chart-line'] },
  { to: '/tenant/contracts', title: 'Mes contrats', icon: ['fas', 'file-contract'] },
  { to: '/tenant/property', title: 'Mon logement', icon: ['fas', 'home'] },
  { to: '/tenant/payments', title: 'Paiements', icon: ['fas', 'money-bill'] },
  { to: '/tenant/complaints', title: 'Signaler un problème', icon: ['fas', 'exclamation-circle'] },
];

const landlordMenu = [
  { to: '/landlord/dashboard', title: 'Tableau de bord', icon: ['fas', 'chart-line'] },
  { to: '/landlord/properties', title: 'Mes propriétés', icon: ['fas', 'building'] },
  { to: '/landlord/tenants', title: 'Mes locataires', icon: ['fas', 'users'] },
  { to: '/landlord/rentals', title: 'Locations', icon: ['fas', 'file-contract'] },
  { to: '/landlord/payments', title: 'Paiements', icon: ['fas', 'money-bill'] },
  { to: '/landlord/maintenance', title: 'Maintenance', icon: ['fas', 'tools'] },
];

// Données utilisateur
const userType = computed(() => authStore.user?.role || '');
const userName = computed(() => authStore.user?.name || '');

const userInitials = computed(() => {
  const name = authStore.user?.name || '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

const userRoleLabel = computed(() => {
  switch (userType.value) {
    case 'admin': return 'Administrateur';
    case 'agent': return 'Agent immobilier';
    case 'tenant': return 'Locataire';
    case 'landlord': return 'Propriétaire';
    default: return '';
  }
});

// Vérification de la route active
const isActive = (path: string) => route.path.startsWith(path);

// Déconnexion
const logout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};
</script>
