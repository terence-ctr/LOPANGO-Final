<template>
  <div class="p-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestion des réclamations</h1>
      <div class="flex space-x-4">
        <button 
          @click="showAddComplaintModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <font-awesome-icon icon="exclamation-circle" class="mr-2" />
          Nouvelle réclamation
        </button>
        <button 
          @click="exportComplaints"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <font-awesome-icon icon="file-export" class="mr-2" />
          Exporter
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div class="relative">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher..."
            class="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <font-awesome-icon icon="search" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div class="flex space-x-4">
          <select 
            v-model="selectedStatus"
            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolue</option>
            <option value="closed">Clôturée</option>
          </select>
          <select 
            v-model="selectedPriority"
            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les priorités</option>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tableau des réclamations -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Titre
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Propriété
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Locataire
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priorité
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Créée le
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="complaint in filteredComplaints" :key="complaint.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ complaint.title }}
              </div>
              <div class="text-sm text-gray-500">
                {{ complaint.description.substring(0, 50) }}...
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ complaint.property.name }}</div>
              <div class="text-sm text-gray-500">{{ complaint.property.address }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ complaint.tenant.name }}</div>
              <div class="text-sm text-gray-500">{{ complaint.tenant.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                getStatusColor(complaint.status)
              ]">
                {{ complaint.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                getPriorityColor(complaint.priority)
              ]">
                {{ complaint.priority }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(complaint.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button 
                @click="viewComplaint(complaint)"
                class="text-blue-600 hover:text-blue-900 mr-2"
              >
                <font-awesome-icon icon="eye" />
              </button>
              <button 
                @click="editComplaint(complaint)"
                class="text-yellow-600 hover:text-yellow-900 mr-2"
              >
                <font-awesome-icon icon="edit" />
              </button>
              <button 
                @click="deleteComplaint(complaint)"
                class="text-red-600 hover:text-red-900"
              >
                <font-awesome-icon icon="trash" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-6">
      <div class="text-sm text-gray-700">
        Page {{ currentPage }} sur {{ totalPages }}
      </div>
      <div class="flex items-center space-x-2">
        <button 
          @click="previousPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <font-awesome-icon icon="chevron-left" />
        </button>
        <span class="px-4 py-2 border border-gray-300 rounded-md">
          {{ currentPage }}
        </span>
        <button 
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <font-awesome-icon icon="chevron-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// États
const searchQuery = ref('');
const selectedStatus = ref('');
const selectedPriority = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Données de démonstration
const complaints = ref([
  {
    id: 1,
    title: 'Problème de chauffage',
    description: 'Le chauffage ne fonctionne pas dans la chambre principale.',
    property: {
      name: 'Appartement 123',
      address: '123 Rue de Paris, 75000 Paris'
    },
    tenant: {
      name: 'Jean Dupont',
      email: 'jd@immo.com'
    },
    status: 'in_progress',
    priority: 'high',
    created_at: '2024-01-15',
    attachments: []
  },
  // Ajoutez d'autres réclamations ici
]);

// Computed properties
const filteredComplaints = computed(() => {
  return complaints.value
    .filter(complaint => 
      complaint.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      complaint.property.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      complaint.tenant.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    .filter(complaint => 
      !selectedStatus.value || complaint.status === selectedStatus.value
    )
    .filter(complaint => 
      !selectedPriority.value || complaint.priority === selectedPriority.value
    )
    .slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage);
});

const totalPages = computed(() => {
  const totalItems = complaints.value.length;
  return Math.ceil(totalItems / itemsPerPage);
});

// Méthodes
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-blue-100 text-blue-800';
    case 'high':
      return 'bg-yellow-100 text-yellow-800';
    case 'urgent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const viewComplaint = (complaint: any) => {
  // TODO: Implémenter la vue détaillée de la réclamation
  console.log('Voir la réclamation:', complaint);
};

const editComplaint = (complaint: any) => {
  // TODO: Implémenter l'édition de la réclamation
  console.log('Éditer la réclamation:', complaint);
};

const deleteComplaint = async (complaint: any) => {
  // TODO: Implémenter la suppression de la réclamation
  if (confirm(`Êtes-vous sûr de vouloir supprimer la réclamation "${complaint.title}" ?`)) {
    try {
      // Appel API pour supprimer la réclamation
      console.log('Supprimer la réclamation:', complaint);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }
};

const exportComplaints = () => {
  // TODO: Implémenter l'export des réclamations
  console.log('Exporter les réclamations');
};

const showAddComplaintModal = ref(false);
</script>
