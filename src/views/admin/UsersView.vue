<template>
  <div class="p-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestion des utilisateurs</h1>
      <div class="flex space-x-4">
        <button 
          @click="showAddUserModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <font-awesome-icon icon="user-plus" class="mr-2" />
          Nouvel utilisateur
        </button>
        <button 
          @click="exportUsers"
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
            v-model="selectedRole"
            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les rôles</option>
            <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
          </select>
          <select 
            v-model="selectedStatus"
            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tableau des utilisateurs -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rôle
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Créé le
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <img class="h-10 w-10 rounded-full" :src="user.avatar || '/default-avatar.png'" alt="" />
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ user.username }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                {{ user.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button 
                @click="editUser(user)"
                class="text-blue-600 hover:text-blue-900 mr-2"
              >
                <font-awesome-icon icon="edit" />
              </button>
              <button 
                @click="deleteUser(user)"
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
import { useAuthStore } from '@/stores/auth';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const authStore = useAuthStore();

// États
const searchQuery = ref('');
const selectedRole = ref('');
const selectedStatus = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Données
const users = ref([
  {
    id: 1,
    name: 'Jean Dupont',
    username: 'jd@immo.com',
    email: 'jd@immo.com',
    role: 'agent',
    status: 'active',
    created_at: '2024-01-15',
    avatar: '/default-avatar.png'
  },
  // Ajoutez d'autres utilisateurs ici
]);

// Rôles disponibles
const roles = ref(['admin', 'agent', 'landlord', 'tenant']);

// Computed properties
const filteredUsers = computed(() => {
  return users.value
    .filter(user => 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    .filter(user => 
      !selectedRole.value || user.role === selectedRole.value
    )
    .filter(user => 
      !selectedStatus.value || user.status === selectedStatus.value
    )
    .slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage);
});

const totalPages = computed(() => {
  const totalItems = users.value.length;
  return Math.ceil(totalItems / itemsPerPage);
});

// Méthodes
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
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

const editUser = (user: any) => {
  // TODO: Implémenter l'édition de l'utilisateur
  console.log('Éditer l\'utilisateur:', user);
};

const deleteUser = async (user: any) => {
  // TODO: Implémenter la suppression de l'utilisateur
  if (confirm(`Êtes-vous sûr de vouloir supprimer l\'utilisateur ${user.name} ?`)) {
    try {
      // Appel API pour supprimer l'utilisateur
      console.log('Supprimer l\'utilisateur:', user);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }
};

const exportUsers = () => {
  // TODO: Implémenter l'export des utilisateurs
  console.log('Exporter les utilisateurs');
};

const showAddUserModal = ref(false);
</script>
