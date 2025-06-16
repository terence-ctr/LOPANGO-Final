<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestion des taxes</h1>
      <button 
        @click="showAddTaxModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Nouvelle taxe
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
            placeholder="Nom, référence..."
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
            <option value="property">Taxe foncière</option>
            <option value="income">Taxe sur les revenus</option>
            <option value="service">Taxe sur les services</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Période</label>
          <div class="flex space-x-2">
            <input 
              type="date" 
              v-model="startDate"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-500">-</span>
            <input 
              type="date" 
              v-model="endDate"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Montant</label>
          <div class="flex space-x-2">
            <input 
              type="number" 
              v-model="minAmount"
              placeholder="Min"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-500">€</span>
            <span class="text-gray-500">-</span>
            <input 
              type="number" 
              v-model="maxAmount"
              placeholder="Max"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-500">€</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Table des taxes -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxe</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bien</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="tax in filteredTaxes" :key="tax.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ tax.name }}</div>
                <div class="text-sm text-gray-500">{{ tax.reference }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getTypeBadgeClass(tax.type)">
                  {{ formatType(tax.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ tax.property?.address }}</div>
                <div class="text-sm text-gray-500">{{ tax.property?.type }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">{{ formatCurrency(tax.amount) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(tax.startDate) }}</div>
                <div class="text-sm text-gray-500">→ {{ formatDate(tax.endDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(tax.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ formatStatus(tax.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="editTax(tax)"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Modifier
                </button>
                <button 
                  @click="confirmDeleteTax(tax)"
                  class="text-red-600 hover:text-red-900"
                >
                  Supprimer
                </button>
              </td>
            </tr>
            <tr v-if="filteredTaxes.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                Aucune taxe trouvée
              </td>
            </tr>
          </tbody>
        </table>
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
const startDate = ref('');
const endDate = ref('');
const minAmount = ref('');
const maxAmount = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Données factices pour l'exemple
const taxes = ref([
  {
    id: 1,
    name: 'Taxe foncière annuelle',
    reference: 'TX-2024-001',
    type: 'property',
    status: 'pending',
    amount: 1200,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    property: {
      address: '123 Rue de Paris, 75000 Paris',
      type: 'Appartement'
    }
  },
  {
    id: 2,
    name: 'Taxe sur les revenus locatifs',
    reference: 'TX-2024-002',
    type: 'income',
    status: 'paid',
    amount: 500,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    property: {
      address: '25 Avenue des Champs-Élysées, 75008 Paris',
      type: 'Appartement'
    }
  }
]);

// Calculer le nombre total de pages
const totalPages = computed(() => {
  return Math.ceil(filteredTaxes.value.length / itemsPerPage);
});

// Filtrer les taxes
const filteredTaxes = computed(() => {
  let filtered = [...taxes.value];

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(tax => 
      tax.name.toLowerCase().includes(query) ||
      tax.reference.toLowerCase().includes(query) ||
      tax.property?.address.toLowerCase().includes(query)
    );
  }

  // Filtrer par type
  if (typeFilter.value) {
    filtered = filtered.filter(tax => tax.type === typeFilter.value);
  }

  // Filtrer par période
  if (startDate.value) {
    const start = new Date(startDate.value);
    filtered = filtered.filter(tax => 
      new Date(tax.startDate) >= start
    );
  }
  if (endDate.value) {
    const end = new Date(endDate.value);
    filtered = filtered.filter(tax => 
      new Date(tax.endDate) <= end
    );
  }

  // Filtrer par montant
  if (minAmount.value) {
    filtered = filtered.filter(tax => tax.amount >= parseInt(minAmount.value));
  }
  if (maxAmount.value) {
    filtered = filtered.filter(tax => tax.amount <= parseInt(maxAmount.value));
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

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'property':
      return 'bg-blue-100 text-blue-800';
    case 'income':
      return 'bg-green-100 text-green-800';
    case 'service':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatType = (type: string) => {
  switch (type) {
    case 'property':
      return 'Taxe foncière';
    case 'income':
      return 'Taxe sur les revenus';
    case 'service':
      return 'Taxe sur les services';
    default:
      return type;
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Payé';
    case 'pending':
      return 'En attente';
    case 'failed':
      return 'Échoué';
    default:
      return status;
  }
};

// Méthodes d'action
const showAddTaxModal = ref(false);

const editTax = (tax: any) => {
  console.log('Modifier la taxe:', tax);
};

const confirmDeleteTax = (tax: any) => {
  console.log('Supprimer la taxe:', tax);
};
</script>