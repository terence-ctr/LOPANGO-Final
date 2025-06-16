<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Suivi des paiements</h1>
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium">Historique des paiements</h2>
          <div class="flex space-x-2">
            <select class="border rounded-md px-3 py-1 text-sm">
              <option>Tous les statuts</option>
              <option>Payé</option>
              <option>En attente</option>
              <option>En retard</option>
            </select>
            <button class="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 text-sm">
              Exporter
            </button>
          </div>
        </div>
      </div>
      <div class="p-4">
        <p class="text-gray-500">Aucun paiement enregistré pour le moment.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logique du composant ici
</script>
