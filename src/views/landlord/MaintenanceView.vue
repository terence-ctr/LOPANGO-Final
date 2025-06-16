<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Demandes de maintenance</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Carte des demandes en cours -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-2">Demandes en cours</h3>
        <p class="text-3xl font-bold mb-4">0</p>
        <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Voir tout →
        </button>
      </div>
      
      <!-- Carte des demandes urgentes -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-2">Urgent</h3>
        <p class="text-3xl font-bold mb-4">0</p>
        <button class="text-red-600 hover:text-red-800 text-sm font-medium">
          Voir les urgences →
        </button>
      </div>
      
      <!-- Carte des demandes terminées -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-2">Terminées (30j)</h3>
        <p class="text-3xl font-bold mb-4">0</p>
        <button class="text-green-600 hover:text-green-800 text-sm font-medium">
          Voir l'historique →
        </button>
      </div>
    </div>
    
    <!-- Liste des demandes récentes -->
    <div class="mt-8 bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium">Dernières demandes</h2>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
            Nouvelle demande
          </button>
        </div>
      </div>
      <div class="p-4">
        <p class="text-gray-500">Aucune demande de maintenance récente.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logique du composant ici
</script>
