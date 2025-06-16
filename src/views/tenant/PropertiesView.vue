<template>
  <main class="flex-1 p-8">
    <!-- Formulaire d'ajout de propriété -->
    <div v-if="showAddPropertyForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div class="w-full max-w-2xl mt-10 mb-10">
        <PropertyForm 
          @cancel="showAddPropertyForm = false"
          @submit="handlePropertyCreated"
        />
      </div>
    </div>
    <header class="flex justify-between items-center mb-8">
      <h1 class="text-black font-extrabold text-lg leading-6 select-none">
        Mes propriétés
      </h1>
      <button 
        @click="handleAddProperty"
        class="bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold rounded px-4 py-2 flex items-center transition-colors duration-200"
      >
        <font-awesome-icon icon="plus" class="mr-2 text-xs" />
        Ajouter un logement
      </button>
    </header>
    
    <!-- Filters -->
    <div class="flex gap-3 mb-6 flex-wrap">
      <button class="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 hover:bg-gray-100" 
              type="button" @click="toggleFilters">
        <i class="fas fa-sliders-h text-xs"></i>
        Filtrer
        <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>
      
      <select v-model="filters.column" 
              class="border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600">
        <option value="">Colonnes</option>
        <option v-for="column in availableColumns" :key="column.value" :value="column.value">
          {{ column.label }}
        </option>
      </select>
      
      <input v-model="searchQuery"
             class="border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600" 
             placeholder="Recherche..." 
             type="search"
             @input="handleSearch" />
      
      <select v-model="filters.status" 
              class="border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600">
        <option value="">Statut</option>
        <option value="actif">Actif</option>
        <option value="inactif">Inactif</option>
      </select>
      
      <select v-model="filters.landlord" 
              class="border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600">
        <option value="">Bailleur</option>
        <option v-for="landlord in landlords" :key="landlord.id" :value="landlord.id">
          {{ landlord.name }}
        </option>
      </select>
    </div>
    
    <!-- Table -->
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table class="w-full text-xs text-left text-gray-700 rounded-lg overflow-hidden">
        <thead class="bg-white border-b border-gray-200 rounded-t-lg">
          <tr>
            <th class="py-2 px-3 font-semibold border-r border-gray-200 w-10 rounded-tl-lg">
              #
            </th>
            <th class="py-2 px-3 font-semibold border-r border-gray-200">
              Nom
            </th>
            <th class="py-2 px-3 font-semibold border-r border-gray-200">
              Adresse
            </th>
            <th class="py-2 px-3 font-semibold border-r border-gray-200">
              Bailleur
            </th>
            <th class="py-2 px-3 font-semibold border-r border-gray-200">
              Loyer mensuel
            </th>
            <th class="py-2 px-3 font-semibold border-r border-gray-200">
              Statut
            </th>
            <th class="py-2 px-3 font-semibold w-10 rounded-tr-lg">
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(property, index) in filteredProperties" :key="property.id" 
              class="border-b border-gray-200 hover:bg-gray-50">
            <td class="py-2 px-3 border-r border-gray-200">
              {{ index + 1 }}
            </td>
            <td class="py-2 px-3 border-r border-gray-200">
              {{ property.name }}
            </td>
            <td class="py-2 px-3 border-r border-gray-200">
              {{ property.address }}
            </td>
            <td class="py-2 px-3 border-r border-gray-200">
              <a class="text-blue-600 font-semibold hover:underline" href="#">
                {{ property.landlord }}
              </a>
            </td>
            <td class="py-2 px-3 border-r border-gray-200">
              {{ property.rent }}$
            </td>
            <td :class="['py-2', 'px-3', 'border-r', 'border-gray-200', 'font-semibold', 
                         property.status === 'Actif' ? 'text-green-600' : 'text-red-500']">
              {{ property.status }}
            </td>
            <td class="py-2 px-3 text-center cursor-pointer select-none">
              <button @click="openPropertyMenu(property)" class="p-1">
                ...
              </button>
            </td>
          </tr>
          <tr v-if="filteredProperties.length === 0">
            <td colspan="7" class="py-4 text-center text-gray-500">
              Aucune propriété trouvée
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="mt-4 flex justify-between items-center">
      <div class="text-sm text-gray-500">
        Affichage de {{ filteredProperties.length }} sur {{ properties.length }} propriétés
      </div>
      <div class="flex gap-2">
        <button :disabled="currentPage === 1" 
                @click="currentPage--" 
                class="px-3 py-1 border rounded-md text-sm"
                :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'">
          Précédent
        </button>
        <button v-for="page in totalPages" :key="page"
                @click="currentPage = page"
                class="w-8 h-8 rounded-md text-sm"
                :class="currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'">
          {{ page }}
        </button>
        <button :disabled="currentPage >= totalPages" 
                @click="currentPage++" 
                class="px-3 py-1 border rounded-md text-sm"
                :class="currentPage >= totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'">
          Suivant
        </button>
      </div>
    </div>
    
    <!-- Property Menu Modal -->
    <div v-if="selectedProperty" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-4 w-64">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold">Actions</h3>
          <button @click="selectedProperty = null" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="space-y-2">
          <button @click="viewProperty(selectedProperty)" class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
            Voir les détails
          </button>
          <button @click="editProperty(selectedProperty)" class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
            Modifier
          </button>
          <button @click="deleteProperty(selectedProperty)" class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PropertyForm from '@/components/tenant/properties/PropertyForm.vue';

// User data
const userAvatar = ref('https://storage.googleapis.com/a1aa/image/7d7f78f6-345d-43be-edec-e470151ec5de.jpg');

// Properties data
const properties = ref([
  {
    id: 1,
    name: 'Appartement B20',
    address: 'Luapula A16, C/Barumbu, Immeuble Dan',
    landlord: 'Landry Doe',
    rent: 400,
    status: 'Actif'
  },
  {
    id: 2,
    name: 'Appartement B21',
    address: 'Luapula A16, C/Kin, Immeuble Boketshu',
    landlord: 'Landry Doe',
    rent: 350,
    status: 'Inactif'
  },
  {
    id: 3,
    name: 'Appartement B22',
    address: 'Luapula A16, C/Lemba, Immeuble Dan',
    landlord: 'Landry Doe',
    rent: 300,
    status: 'Inactif'
  },
  {
    id: 4,
    name: 'Appartement B23',
    address: 'Luapula A16, C/Bumbu, Immeuble Dan',
    landlord: 'Landry Doe',
    rent: 150,
    status: 'Inactif'
  }
]);

// Filters and search
const filters = ref({
  status: '',
  landlord: '',
  column: ''
});

const searchQuery = ref('');
const selectedProperty = ref(null);
const currentPage = ref(1);
const itemsPerPage = 10;
const showAddPropertyForm = ref(false);

// Computed properties
const filteredProperties = computed(() => {
  return properties.value.filter(property => {
    const matchesSearch = !searchQuery.value || 
      property.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      property.landlord.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesStatus = !filters.value.status || 
      (filters.value.status === 'actif' ? 'Actif' : 'Inactif') === property.status;
      
    const matchesLandlord = !filters.value.landlord || 
      (property.landlord && typeof property.landlord === 'string' && 
      filters.value.landlord && typeof filters.value.landlord === 'string' &&
      property.landlord.toLowerCase().includes(filters.value.landlord.toLowerCase()));
    
    return matchesSearch && matchesStatus && matchesLandlord;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredProperties.value.length / itemsPerPage);
});

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredProperties.value.slice(start, start + itemsPerPage);
});

// Available columns for filtering
const availableColumns = [
  { value: 'name', label: 'Nom' },
  { value: 'address', label: 'Adresse' },
  { value: 'landlord', label: 'Bailleur' },
  { value: 'rent', label: 'Loyer' },
  { value: 'status', label: 'Statut' }
];

// Available landlords
const landlords = computed(() => {
  const uniqueLandlords = new Set(properties.value.map(p => p.landlord));
  return Array.from(uniqueLandlords).map((name, index) => ({
    id: index + 1,
    name
  }));
});

// Methods
const toggleFilters = () => {
  // Toggle filter visibility logic here
  console.log('Toggle filters');
};

const handleSearch = () => {
  currentPage.value = 1; // Reset to first page on new search
};

const openPropertyMenu = (property) => {
  selectedProperty.value = property;
};

const viewProperty = (property) => {
  console.log('View property:', property);
  selectedProperty.value = null;
};

const editProperty = (property) => {
  console.log('Edit property:', property);
  selectedProperty.value = null;
};

const deleteProperty = (property) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la propriété ${property.name} ?`)) {
    properties.value = properties.value.filter(p => p.id !== property.id);
    selectedProperty.value = null;
  }
};

const handleAddProperty = () => {
  showAddPropertyForm.value = true;
};

const handlePropertyCreated = (newProperty) => {
  // Ajoute la nouvelle propriété à la liste
  properties.value.unshift({
    id: properties.value.length + 1, // À remplacer par l'ID généré par votre API
    name: newProperty.name,
    type: newProperty.type,
    address: {
      street: newProperty.address.street,
      postalCode: newProperty.address.postalCode,
      city: newProperty.address.city
    },
    rent: 0, // Valeur par défaut, à mettre à jour selon vos besoins
    status: 'Inactif', // Statut par défaut
    surface: newProperty.surface,
    rooms: newProperty.rooms,
    floor: newProperty.floor,
    equipments: [...newProperty.equipments]
  });
  showAddPropertyForm.value = false;
  
  // Afficher un message de succès
  alert('Le logement a été ajouté avec succès !');
};

// Lifecycle hooks
onMounted(() => {
  // Fetch properties from API if needed
  // fetchProperties();
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
