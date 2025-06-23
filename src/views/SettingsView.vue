<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Paramètres</h1>
    </div>

    <!-- Préférences générales -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">Préférences générales</h2>
      <div class="space-y-6">
        <!-- Thème -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Thème</label>
          <select 
            v-model="settings.theme"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
            <option value="system">Système</option>
          </select>
        </div>

        <!-- Langue -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Langue</label>
          <select 
            v-model="settings.language"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="fr">Français</option>
            <option value="en">Anglais</option>
          </select>
        </div>

        <!-- Notifications -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notifications par email</label>
          <div class="mt-2 space-y-2">
            <div class="flex items-center">
              <input 
                v-model="settings.notifications.email.newPayments"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">Nouveaux paiements</label>
            </div>
            <div class="flex items-center">
              <input 
                v-model="settings.notifications.email.contractRenewal"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">Renouvellement de contrat</label>
            </div>
            <div class="flex items-center">
              <input 
                v-model="settings.notifications.email.maintenance"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 text-sm text-gray-700">Maintenance</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sécurité -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">Sécurité</h2>
      <div class="space-y-6">
        <!-- Authentification à deux facteurs -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Authentification à deux facteurs</label>
          <div class="flex items-center">
            <input 
              v-model="settings.security.twoFactorAuth"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label class="ml-2 text-sm text-gray-700">Activer l'authentification à deux facteurs</label>
          </div>
        </div>

        <!-- Sessions actives -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sessions actives</label>
          <div class="mt-2 space-y-2">
            <div v-for="session in sessions" :key="session.id" class="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ session.device }}</p>
                <p class="text-sm text-gray-500">{{ session.location }}</p>
              </div>
              <button 
                @click="terminateSession(session.id)"
                class="text-red-600 hover:text-red-700"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sauvegarde -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-bold mb-4">Sauvegarde</h2>
      <div class="space-y-4">
        <button 
          @click="backupData"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Créer une sauvegarde
        </button>
        <button 
          @click="restoreData"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Restaurer une sauvegarde
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Données des paramètres
const settings = ref({
  theme: 'system',
  language: 'fr',
  notifications: {
    email: {
      newPayments: true,
      contractRenewal: true,
      maintenance: true
    }
  },
  security: {
    twoFactorAuth: false
  }
});

// Données factices des sessions
const sessions = ref([
  {
    id: 1,
    device: 'Ordinateur Windows',
    location: 'Paris,congo'
  },
  {
    id: 2,
    device: 'Smartphone Android',
    location: 'Lyon,congo'
  }
]);

// Méthodes
const terminateSession = (sessionId: number) => {
  console.log('Terminer la session:', sessionId);
};

const backupData = () => {
  console.log('Créer une sauvegarde');
};

const restoreData = () => {
  console.log('Restaurer une sauvegarde');
};
</script>
