<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestion des paiements</h1>
      <div class="flex space-x-4">
        <button 
          @click="showAddPaymentModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nouveau paiement
        </button>
        <button 
          @click="exportPayments"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          Exporter
        </button>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Numéro, locataire..."
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
            <option value="rent">Loyer</option>
            <option value="security">Dépôt de garantie</option>
            <option value="service">Charges</option>
            <option value="tax">Taxe</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select 
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
            <option value="refunded">Remboursé</option>
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
      </div>
    </div>

    <!-- Table des paiements -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locataire</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bien</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="payment in filteredPayments" :key="payment.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ payment.reference }}</div>
                <div class="text-sm text-gray-500">{{ formatDate(payment.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ payment.tenant.name }}</div>
                <div class="text-sm text-gray-500">{{ payment.tenant.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ payment.property.address }}</div>
                <div class="text-sm text-gray-500">{{ payment.property.type }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">{{ formatCurrency(payment.amount) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getTypeBadgeClass(payment.type)">
                  {{ formatType(payment.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ formatDate(payment.paymentDate) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(payment.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ formatStatus(payment.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  v-if="payment.status === 'pending'"
                  @click="confirmPayment(payment)"
                  class="text-green-600 hover:text-green-900 mr-4"
                >
                  Valider
                </button>
                <button 
                  @click="editPayment(payment)"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Modifier
                </button>
                <button 
                  @click="confirmDeletePayment(payment)"
                  class="text-red-600 hover:text-red-900"
                >
                  Supprimer
                </button>
              </td>
            </tr>
            <tr v-if="filteredPayments.length === 0">
              <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                Aucun paiement trouvé
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
const searchQuery = ref('');
const typeFilter = ref('');
const statusFilter = ref('');
const startDate = ref('');
const endDate = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Données factices pour l'exemple
const payments = ref([
  {
    id: 1,
    reference: 'PAY-2024-001',
    type: 'rent',
    status: 'paid',
    amount: 1200,
    paymentDate: new Date('2024-02-01'),
    createdAt: new Date('2024-01-25'),
    tenant: {
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com'
    },
    property: {
      address: '123 Rue de Paris, 75000 Paris',
      type: 'Appartement'
    }
  },
  {
    id: 2,
    reference: 'PAY-2024-002',
    type: 'security',
    status: 'pending',
    amount: 2400,
    paymentDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-10'),
    tenant: {
      name: 'Marie Martin',
      email: 'marie.martin@example.com'
    },
    property: {
      address: '25 Avenue des Champs-Élysées, 75008 Paris',
      type: 'Appartement'
    }
  }
]);

// Calculer le nombre total de pages
const totalPages = computed(() => {
  return Math.ceil(filteredPayments.value.length / itemsPerPage);
});

// Filtrer les paiements
const filteredPayments = computed(() => {
  let filtered = [...payments.value];

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(payment => 
      payment.reference.toLowerCase().includes(query) ||
      payment.tenant.name.toLowerCase().includes(query) ||
      payment.property.address.toLowerCase().includes(query)
    );
  }

  // Filtrer par type
  if (typeFilter.value) {
    filtered = filtered.filter(payment => payment.type === typeFilter.value);
  }

  // Filtrer par statut
  if (statusFilter.value) {
    filtered = filtered.filter(payment => payment.status === statusFilter.value);
  }

  // Filtrer par période
  if (startDate.value) {
    const start = new Date(startDate.value);
    filtered = filtered.filter(payment => 
      new Date(payment.paymentDate) >= start
    );
  }
  if (endDate.value) {
    const end = new Date(endDate.value);
    filtered = filtered.filter(payment => 
      new Date(payment.paymentDate) <= end
    );
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
    case 'rent':
      return 'bg-blue-100 text-blue-800';
    case 'security':
      return 'bg-green-100 text-green-800';
    case 'service':
      return 'bg-yellow-100 text-yellow-800';
    case 'tax':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatType = (type: string) => {
  switch (type) {
    case 'rent':
      return 'Loyer';
    case 'security':
      return 'Dépôt de garantie';
    case 'service':
      return 'Charges';
    case 'tax':
      return 'Taxe';
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
    case 'refunded':
      return 'bg-blue-100 text-blue-800';
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
    case 'refunded':
      return 'Remboursé';
    default:
      return status;
  }
};

// Méthodes d'action
const showAddPaymentModal = ref(false);

const confirmPayment = (payment: any) => {
  console.log('Valider le paiement:', payment);
};

const editPayment = (payment: any) => {
  console.log('Modifier le paiement:', payment);
};

const confirmDeletePayment = (payment: any) => {
  console.log('Supprimer le paiement:', payment);
};

const exportPayments = () => {
  console.log('Exporter les paiements');
};
</script>