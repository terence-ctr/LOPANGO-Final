<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Mes locataires</h1>
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium">Liste des locataires</h2>
          <input 
            type="text" 
            placeholder="Rechercher un locataire..." 
            class="px-3 py-1 border rounded-md text-sm"
          >
        </div>
      </div>
      <div class="p-4">
        <p class="text-gray-500">Aucun locataire enregistré pour le moment.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logique du composant ici
</script>
