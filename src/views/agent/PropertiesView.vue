<template>
  <div class="p-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Mes propriétés gérées</h1>
      <div class="flex space-x-3">
        <button @click="refreshProperties" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
       
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select v-model="filters.status" class="w-full border rounded-md px-3 py-2 text-sm">
            <option value="">Tous les statuts</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="LOUE">Loué</option>
            <option value="MAINTENANCE">En maintenance</option>
            <option value="INACTIF">Inactif</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select v-model="filters.type" class="w-full border rounded-md px-3 py-2 text-sm">
            <option value="">Tous les types</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="MAISON">Maison</option>
            <option value="LOCAL">Local commercial</option>
            <option value="TERRAIN">Terrain</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <input 
            v-model="filters.search" 
            type="text" 
            class="w-full border rounded-md px-3 py-2 text-sm" 
            placeholder="Rechercher une propriété..."
          />
        </div>
        <div class="flex justify-end">
          <button @click="applyFilters" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Appliquer les filtres
          </button>
         
        </div>
      </div>
    </div>

    <!-- Tableau des propriétés -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des propriétés...</p>
      </div>
      <div v-else-if="!filteredProperties.length" class="p-8 text-center">
        <p class="text-gray-500">Aucune propriété ne correspond à vos critères de recherche.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Surface
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="property in paginatedProperties" :key="property.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                    <img v-if="property.images && property.images[0]" :src="property.images[0]" :alt="property.title" class="h-full w-full object-cover">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ property.title }}</div>
                    <div class="text-sm text-gray-500">{{ property.street }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatPropertyType(property.type) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ property.surface }} m²
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatCurrency(property.rent) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(property.status)">
                  {{ formatStatus(property.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="toggleDropdown(property.id)" 
                        class="text-gray-400 hover:text-gray-500"
                        :aria-expanded="activeDropdown === property.id">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                <div v-if="activeDropdown === property.id" 
                     class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <a href="#" @click="viewPropertyDetails(property.id)" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                      Voir les détails
                    </a>
                    <a href="#" @click="reportProperty(property.id)" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                      Signaler
                    </a>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';

// Types constants
const PROPERTY_TYPES = {
  APPARTEMENT: 'Appartement',
  MAISON: 'Maison',
  LOCAL: 'Local commercial',
  TERRAIN: 'Terrain',
  BUREAU: 'Bureau',
  AUTRE: 'Autre'
} as const;

type PropertyType = keyof typeof PROPERTY_TYPES;

const STATUS_TYPES = {
  DISPONIBLE: 'Disponible',
  LOUE: 'Loué',
  MAINTENANCE: 'En maintenance',
  INACTIF: 'Inactif'
} as const;

type StatusType = keyof typeof STATUS_TYPES;

// Interface pour une propriété
interface Property {
  id: number;
  title: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  type: PropertyType;
  status: StatusType;
  rent: number;
  surface: number;
  rooms: number;
  images?: string[];
}

const router = useRouter();
const authStore = useAuthStore();



// Hooks
onMounted(() => {
  refreshProperties();
});
;

// État
const properties = ref<Property[]>([]);
const isLoading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 10;
// Correction du typage de activeDropdown
const activeDropdown = ref<number | null>(null);

// Filtres
const filters = ref({
  status: '',
  type: '',
  search: ''
});

// Computed properties
const filteredProperties = computed(() => {
  let result = [...properties.value];
  
  // Filtrer par statut
  if (filters.value.status) {
    result = result.filter((prop: Property) => prop.status === filters.value.status);
  }
  
  // Filtrer par type
  if (filters.value.type) {
    result = result.filter((prop: Property) => prop.type === filters.value.type);
  }
  
  // Recherche
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase();
    result = result.filter((prop: Property) => 
      prop.title?.toLowerCase().includes(searchLower)
    );
  }
  
  return result;
});

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProperties.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredProperties.value.length / itemsPerPage);
});

// Méthodes de formatage
const formatPropertyType = (type: string) => {
  const types: Record<string, string> = {
    'APPARTEMENT': 'Appartement',
    'MAISON': 'Maison',
    'LOCAL': 'Local commercial',
    'TERRAIN': 'Terrain',
    'BUREAU': 'Bureau',
    'AUTRE': 'Autre'
  };
  return types[type as keyof typeof types] || type || 'Non spécifié';
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0);
};

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    'DISPONIBLE': 'Disponible',
    'LOUE': 'Loué',
    'MAINTENANCE': 'En maintenance',
    'INACTIF': 'Inactif'
  };
  return statuses[status as keyof typeof statuses] || status || 'Inconnu';
};

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'DISPONIBLE': 'bg-green-100 text-green-800',
    'LOUE': 'bg-blue-100 text-blue-800',
    'MAINTENANCE': 'bg-yellow-100 text-yellow-800',
    'INACTIF': 'bg-gray-100 text-gray-800'
  };
  return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'}`;
};

// Méthodes de gestion
const toggleDropdown = (propertyId: number) => {
  activeDropdown.value = activeDropdown.value === propertyId ? null : propertyId;
};

const viewPropertyDetails = async (propertyId: number) => {
  // Navigation vers la page de détails
  await router.push(`/agent/property/${propertyId}`);
};

const reportProperty = async (propertyId: number) => {
  // Logique de signalement
  console.log('Signalement de la propriété:', propertyId);
  // Ici, vous pouvez ajouter la logique d'API pour envoyer le signalement
};

const refreshProperties = async () => {
  try {
    isLoading.value = true;
    if (!authStore.user?._id) {
      throw new Error('Utilisateur non authentifié');
    }
    const response = await api.get(`/properties/agent/${authStore.user._id}`);
    properties.value = response.data as Property[];
  } catch (error) {
    console.error('Erreur lors du chargement des propriétés:', error);
    properties.value = [];
  } finally {
    isLoading.value = false;
  }
};

const showAddPropertyModal = () => {
  // Ouvrir le modal d'ajout de propriété
  console.log('Ouvrir le modal d\'ajout de propriété');
  // Ici, vous pouvez ajouter la logique pour ouvrir le modal
};

const applyFilters = () => {
  currentPage.value = 1;
};

const resetFilters = () => {
  filters.value = {
    status: '',
    type: '',
    search: ''
  };
  currentPage.value = 1;
};

// Hooks
onMounted(() => {
  refreshProperties();
});
</script>
