<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestion des contrats</h1>
      <button 
        @click="showAddContractModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Nouveau contrat
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
            placeholder="Numéro de contrat, nom..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select 
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="expired">Expiré</option>
            <option value="terminated">Terminé</option>
            <option value="pending">En attente</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table des contrats -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrat</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bien</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locataire</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="contract in filteredContracts" :key="contract.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ contract.number }}</div>
                <div class="text-sm text-gray-500">{{ formatDate(contract.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ contract.property.address }}</div>
                <div class="text-sm text-gray-500">{{ contract.property.type }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ contract.tenant.name }}</div>
                <div class="text-sm text-gray-500">{{ contract.tenant.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">{{ formatCurrency(contract.amount) }}</span>
                <span class="text-sm text-gray-500">/mois</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(contract.startDate) }}</div>
                <div class="text-sm text-gray-500">→ {{ formatDate(contract.endDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(contract.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ formatStatus(contract.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="editContract(contract)"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Modifier
                </button>
                <button 
                  @click="confirmDeleteContract(contract)"
                  class="text-red-600 hover:text-red-900"
                >
                  Supprimer
                </button>
              </td>
            </tr>
            <tr v-if="filteredContracts.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                Aucun contrat trouvé
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// États de la vue
const searchQuery = ref('');
const statusFilter = ref('');

// Données factices pour l'exemple
const contracts = ref([
  {
    id: 1,
    number: 'C-2024-001',
    status: 'active',
    amount: 1200,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2025-01-31'),
    createdAt: new Date('2024-01-15'),
    property: {
      address: '123 Rue de Paris, 75000 Paris',
      type: 'Appartement'
    },
    tenant: {
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com'
    }
  }
]);

// Filtrer les contrats
const filteredContracts = computed(() => {
  let filtered = [...contracts.value];

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(contract => 
      contract.number.toLowerCase().includes(query) ||
      contract.property.address.toLowerCase().includes(query) ||
      contract.tenant.name.toLowerCase().includes(query)
    );
  }

  // Filtrer par statut
  if (statusFilter.value) {
    filtered = filtered.filter(contract => contract.status === statusFilter.value);
  }

  return filtered;
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

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'terminated':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'active':
      return 'Actif';
    case 'expired':
      return 'Expiré';
    case 'terminated':
      return 'Terminé';
    case 'pending':
      return 'En attente';
    default:
      return status;
  }
};

// Méthodes d'action
const editContract = (contract: any) => {
  console.log('Modifier le contrat:', contract);
};

const confirmDeleteContract = (contract: any) => {
  console.log('Supprimer le contrat:', contract);
};
</script>