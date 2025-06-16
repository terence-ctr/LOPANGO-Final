<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Tableau de bord</h1>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Propriétés</h3>
        <div class="text-3xl font-bold text-blue-600">{{ stats.properties }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Locataires</h3>
        <div class="text-3xl font-bold text-green-600">{{ stats.tenants }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Contrats</h3>
        <div class="text-3xl font-bold text-purple-600">{{ stats.contracts }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Revenus</h3>
        <div class="text-3xl font-bold text-yellow-600">{{ stats.revenue }}</div>
      </div>
    </div>

    <!-- Activités récentes -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-bold mb-4">Activités récentes</h2>
      <div class="space-y-4">
        <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <component :is="activity.icon" class="h-6 w-6 text-gray-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ activity.title }}</p>
            <p class="text-sm text-gray-500 truncate">{{ activity.description }}</p>
          </div>
          <div class="ml-4 flex-shrink-0">
            <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="activity.statusClass">
              {{ activity.status }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

// Données factices pour le tableau de bord
const stats = ref({
  properties: 25,
  tenants: 42,
  contracts: 38,
  revenue: '€12,500'
});

const recentActivities = ref([
  {
    id: 1,
    title: 'Nouveau contrat signé',
    description: 'Contrat pour l'appartement 123 Rue de Paris',
    status: 'En cours',
    statusClass: 'bg-blue-100 text-blue-800',
    icon: 'svg-check-circle'
  },
  {
    id: 2,
    title: 'Paiement reçu',
    description: 'Loyer pour février 2024',
    status: 'Réussi',
    statusClass: 'bg-green-100 text-green-800',
    icon: 'svg-money'
  },
  {
    id: 3,
    title: 'Maintenance programmée',
    description: 'Entretien du système de chauffage',
    status: 'À venir',
    statusClass: 'bg-yellow-100 text-yellow-800',
    icon: 'svg-wrench'
  }
]);

// Hooks pour les icônes SVG
const svgCheckCircle = () => <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
  <circle cx="12" cy="12" r="10" />
</svg>;

const svgMoney = () => <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>;

const svgWrench = () => <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>;
</script>
