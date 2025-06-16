<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestion des biens</h1>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Ajouter un bien
      </button>
    </div>
    
    <!-- Filtres et recherche -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type de bien</label>
          <select class="w-full border rounded-md px-3 py-2 text-sm">
            <option>Tous les types</option>
            <option>Appartement</option>
            <option>Maison</option>
            <option>Villa</option>
            <option>Local commercial</option>
            <option>Terrain</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
          <input type="text" class="w-full border rounded-md px-3 py-2 text-sm" placeholder="Toutes les villes">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prix max</label>
          <div class="flex">
            <input type="number" class="w-full border rounded-l-md px-3 py-2 text-sm" placeholder="Prix maximum">
            <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 bg-gray-50 text-gray-500 text-sm">
              €
            </span>
          </div>
        </div>
        <div class="flex items-end">
          <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full text-sm">
            Appliquer les filtres
          </button>
        </div>
      </div>
    </div>
    
    <!-- Liste des biens -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Carte de bien -->
      <div v-for="property in properties" :key="property.id" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <!-- Badge statut -->
        <div class="absolute top-2 right-2">
          <span :class="[property.status === 'Disponible' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800', 'px-2 py-1 rounded-full text-xs font-medium']">
            {{ property.status }}
          </span>
        </div>
        
        <!-- Image du bien -->
        <div class="h-48 bg-gray-200 relative">
          <img v-if="property.images.length > 0" :src="property.images[0]" :alt="property.title" class="w-full h-full object-cover">
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {{ property.images.length }} photos
          </div>
        </div>
        
        <!-- Détails du bien -->
        <div class="p-4">
          <div class="flex justify-between items-start">
            <h3 class="font-bold text-lg text-gray-900">{{ property.title }}</h3>
            <p class="text-lg font-bold text-blue-600">{{ property.price }} €</p>
          </div>
          
          <p class="text-gray-600 text-sm mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ property.location }}
          </p>
          
          <div class="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
            <div class="bg-gray-50 p-2 rounded">
              <div class="font-medium text-gray-900">{{ property.surface }} m²</div>
              <div class="text-gray-500">Surface</div>
            </div>
            <div class="bg-gray-50 p-2 rounded">
              <div class="font-medium text-gray-900">{{ property.rooms }}</div>
              <div class="text-gray-500">Pièces</div>
            </div>
            <div class="bg-gray-50 p-2 rounded">
              <div class="font-medium text-gray-900">{{ property.bedrooms }}</div>
              <div class="text-gray-500">Chambres</div>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <span class="text-sm text-gray-500">Réf: {{ property.reference }}</span>
            <div class="flex space-x-2">
              <button class="p-1 text-gray-400 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button class="p-1 text-gray-400 hover:text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Carte vide pour l'ajout d'un nouveau bien -->
      <div class="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <h3 class="text-lg font-medium text-gray-700">Ajouter un nouveau bien</h3>
        <p class="mt-1 text-sm text-gray-500">Cliquez pour commencer l'ajout d'un nouveau bien immobilier</p>
      </div>
    </div>
    
    <!-- Pagination -->
    <div class="mt-8 flex justify-center">
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          <span class="sr-only">Précédent</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
        <a href="#" aria-current="page" class="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
          1
        </a>
        <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
          2
        </a>
        <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
          3
        </a>
        <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
          ...
        </span>
        <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
          8
        </a>
        <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          <span class="sr-only">Suivant</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
// Données de démonstration
const properties = [
  {
    id: 1,
    title: 'Appartement T3 lumineux',
    reference: 'APP-2023-001',
    price: '250 000',
    location: 'Paris 15ème',
    surface: 65,
    rooms: 3,
    bedrooms: 2,
    status: 'Disponible',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 2,
    title: 'Maison avec jardin',
    reference: 'MAI-2023-002',
    price: '420 000',
    location: 'Versailles',
    surface: 120,
    rooms: 5,
    bedrooms: 3,
    status: 'En attente',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 3,
    title: 'Studio meublé centre-ville',
    reference: 'STU-2023-003',
    price: '180 000',
    location: 'Lyon 2ème',
    surface: 28,
    rooms: 1,
    bedrooms: 1,
    status: 'Disponible',
    images: [
      'https://images.unsplash.com/photo-1502672260266-37a1c303eaff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
    ]
  }
];
</script>
