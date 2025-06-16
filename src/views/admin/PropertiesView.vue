<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestion des biens immobiliers</h1>
      <button 
        @click="showAddPropertyModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Ajouter un bien
      </button>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Adresse, référence..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select 
            v-model="typeFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="apartment">Appartement</option>
            <option value="house">Maison</option>
            <option value="store">Local commercial</option>
            <option value="office">Bureau</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select 
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="rented">Loué</option>
            <option value="maintenance">En maintenance</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prix mensuel</label>
          <div class="flex space-x-2">
            <input 
              type="number" 
              v-model="minPrice"
              placeholder="Min"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-500">€</span>
            <span class="text-gray-500">-</span>
            <input 
              type="number" 
              v-model="maxPrice"
              placeholder="Max"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-500">€</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Grille des propriétés -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="property in filteredProperties" 
        :key="property.id"
        class="bg-white rounded-lg shadow overflow-hidden"
      >
        <div class="relative h-48">
          <img 
            :src="property.mainImage || 'https://via.placeholder.com/400x300'" 
            :alt="property.address"
            class="w-full h-full object-cover"
          >
          <div 
            v-if="property.status === 'maintenance'" 
            class="absolute top-0 right-0 bg-yellow-100 text-yellow-800 px-3 py-1 text-sm rounded-bl-lg"
          >
            En maintenance
          </div>
          <div 
            v-if="property.status === 'rented'" 
            class="absolute top-0 right-0 bg-green-100 text-green-800 px-3 py-1 text-sm rounded-bl-lg"
          >
            Loué
          </div>
        </div>
        <div class="p-4">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-medium text-gray-900">{{ property.address }}</h3>
            <span class="text-sm text-gray-500">{{ formatDate(property.createdAt) }}</span>
          </div>
          <div class="mt-2">
            <p class="text-gray-500">{{ property.description }}</p>
            <div class="mt-2 flex items-center">
              <span class="text-xl font-bold text-gray-900">{{ formatCurrency(property.price) }}</span>
              <span class="ml-1 text-sm text-gray-500">/mois</span>
            </div>
          </div>
          <div class="mt-4 flex items-center space-x-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ property.type }}
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {{ property.rooms }} chambres
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {{ property.surface }}m²
            </span>
          </div>
          <div class="mt-4 flex justify-between items-center">
            <button 
              @click="editProperty(property)"
              class="text-blue-600 hover:text-blue-900"
            >
              Modifier
            </button>
            <button 
              @click="confirmDeleteProperty(property)"
              class="text-red-600 hover:text-red-900"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
      <div v-if="filteredProperties.length === 0" class="col-span-3 text-center py-12">
        <p class="text-gray-500">Aucun bien trouvé</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-6">
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button 
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <span class="sr-only">Précédent</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <button 
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          :class="{
            'z-10 bg-blue-50 border-blue-500 text-blue-600': currentPage === page,
            'bg-white border-gray-300 text-gray-500 hover:bg-gray-50': currentPage !== page
          }"
          class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
        >
          {{ page }}
        </button>
        <button 
          @click="currentPage++"
          :disabled="currentPage >= totalPages"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <span class="sr-only">Suivant</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// États de la vue
const searchQuery = ref('');
const typeFilter = ref('');
const statusFilter = ref('');
const minPrice = ref('');
const maxPrice = ref('');
const currentPage = ref(1);
const itemsPerPage = 9;

// Données factices pour l'exemple
const properties = ref([
  {
    id: 1,
    address: '123 Rue de Paris, 75000 Paris',
    type: 'apartment',
    status: 'available',
    price: 1200,
    rooms: 3,
    surface: 85,
    description: 'Appartement moderne avec vue sur la ville',
    mainImage: 'https://via.placeholder.com/400x300',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2,
    address: '25 Avenue des Champs-Élysées, 75008 Paris',
    type: 'apartment',
    status: 'rented',
    price: 2500,
    rooms: 4,
    surface: 120,
    description: 'Penthouse avec terrasse',
    mainImage: 'https://via.placeholder.com/400x300',
    createdAt: new Date('2024-01-10')
  },
  {
    id: 3,
    address: '56 Rue de la Paix, 75002 Paris',
    type: 'store',
    status: 'available',
    price: 5000,
    rooms: 1,
    surface: 150,
    description: 'Local commercial en plein centre',
    mainImage: 'https://via.placeholder.com/400x300',
    createdAt: new Date('2024-01-05')
  }
]);

// Calculer le nombre total de pages
const totalPages = computed(() => {
  return Math.ceil(filteredProperties.value.length / itemsPerPage);
});

// Filtrer les propriétés
const filteredProperties = computed(() => {
  let filtered = [...properties.value];

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(property => 
      property.address.toLowerCase().includes(query) ||
      property.description.toLowerCase().includes(query)
    );
  }

  // Filtrer par type
  if (typeFilter.value) {
    filtered = filtered.filter(property => property.type === typeFilter.value);
  }

  // Filtrer par statut
  if (statusFilter.value) {
    filtered = filtered.filter(property => property.status === statusFilter.value);
  }

  // Filtrer par prix
  if (minPrice.value) {
    filtered = filtered.filter(property => property.price >= parseInt(minPrice.value));
  }
  if (maxPrice.value) {
    filtered = filtered.filter(property => property.price <= parseInt(maxPrice.value));
  }

  // Paginer les résultats
  const start = (currentPage.value - 1) * itemsPerPage;
  return filtered.slice(start, start + itemsPerPage);
});

// Méthodes utilitaires
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Méthodes d'action
const showAddPropertyModal = ref(false);

const editProperty = (property: any) => {
  // À implémenter
  console.log('Modifier le bien:', property);
};

const confirmDeleteProperty = (property: any) => {
  // À implémenter
  console.log('Supprimer le bien:', property);
};
</script>
