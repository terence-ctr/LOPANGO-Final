<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête avec titre et bouton d'action -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes contrats de gestion</h1>
        <p class="mt-1 text-sm text-gray-500">Gérez vos contrats de location</p>
      </div>
      <div class="flex items-center space-x-4">
        <button 
          @click="showCreateContract = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i class="fas fa-plus mr-2"></i>
          Nouveau contrat
        </button>
      </div>
    </div>
    
    <!-- Filtres et recherche -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-6 space-y-4 sm:space-y-0">
      <!-- Filtre par statut -->
      <div class="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 w-full sm:w-auto">
        <i class="fas fa-filter"></i>
        <select 
          v-model="filters.status" 
          class="appearance-none bg-transparent focus:outline-none cursor-pointer"
          @change="(e) => loadContracts()"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="pending">En attente</option>
          <option value="ended">Terminé</option>
          <option value="cancelled">Annulé</option>
          <option value="draft">Brouillon</option>
        </select>
        <i class="fas fa-chevron-down text-xs"></i>
      </div>
      
      <!-- Filtre par bailleur -->
      <div class="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 w-full sm:w-auto">
        <i class="fas fa-user"></i>
        <select 
          v-model="filters.landlordId" 
          class="appearance-none bg-transparent focus:outline-none cursor-pointer"
          @change="(e) => loadContracts()"
        >
          <option value="">Tous les bailleurs</option>
          <option v-for="landlord in landlords" :key="landlord.id" :value="landlord.id">
            {{ landlord.firstName }} {{ landlord.lastName }}
          </option>
        </select>
        <i class="fas fa-chevron-down text-xs"></i>
      </div>
      
      <!-- Recherche -->
      <div class="relative flex-1">
        <input 
          v-model="searchQuery"
          type="search" 
          placeholder="Rechercher un contrat..." 
          class="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          @input="onSearchInput"
        >
        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
    </div>
    
    <!-- Tableau des contrats -->
    <div class="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propriété
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bailleur
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Locataire
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loyer
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- État de chargement -->
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                <div class="flex justify-center items-center space-x-2">
                  <i class="fas fa-circle-notch fa-spin text-blue-600"></i>
                  <span>Chargement des contrats...</span>
                </div>
              </td>
            </tr>
            
            <!-- Message d'erreur -->
            <tr v-else-if="error">
              <td colspan="7" class="px-6 py-4 text-center text-red-500">
                <div class="flex flex-col items-center space-y-2">
                  <i class="fas fa-exclamation-triangle text-xl"></i>
                  <span>{{ error }}</span>
                  <button 
                    @click="loadContracts"
                    class="mt-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                  >
                    Réessayer
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Aucun résultat -->
            <tr v-else-if="contracts.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <i class="fas fa-file-contract text-4xl text-gray-300 mb-3"></i>
                  <p class="text-lg font-medium">Aucun contrat trouvé</p>
                  <p class="text-sm mt-1">Vous n'avez pas encore de contrats enregistrés.</p>
                </div>
              </td>
            </tr>
            
            <!-- Liste des contrats -->
            <tr 
              v-for="contract in contracts" 
              :key="contract.id"
              class="hover:bg-gray-50"
            >
              <!-- Propriété -->
              <td class="px-6 py-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mt-1">
                    <i class="fas fa-home text-gray-500"></i>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ contract.property?.title || 'Propriété sans nom' }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ formatAddress(contract.property?.address) }}
                    </div>
                  </div>
                </div>
              </td>
              
              <!-- Bailleur -->
              <td class="px-6 py-4">
                <div v-if="contract.landlord" class="text-sm text-gray-900">
                  {{ contract.landlord.firstName }} {{ contract.landlord.lastName }}
                </div>
                <div v-else class="text-sm text-gray-500">
                  Non spécifié
                </div>
              </td>
              
              <!-- Locataire -->
              <td class="px-6 py-4">
                <div v-if="contract.tenant" class="text-sm text-gray-900">
                  {{ contract.tenant.firstName }} {{ contract.tenant.lastName }}
                </div>
                <div v-else class="text-sm text-gray-500">
                  Non spécifié
                </div>
              </td>
              
              <!-- Période -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  Du {{ formatDate(contract.startDate) }}
                </div>
                <div class="text-sm text-gray-500">
                  au {{ contract.endDate ? formatDate(contract.endDate) : 'Indéterminé' }}
                </div>
              </td>
              
              <!-- Loyer -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(contract.rent, contract.currency) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ contract.paymentDay ? `Le ${contract.paymentDay} de chaque mois` : 'Non spécifié' }}
                </div>
              </td>
              
              <!-- Statut -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusBadgeClass(contract.status)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getStatusLabel(contract.status) }}
                </span>
              </td>
              
              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="relative">
                  <button 
                    @click="(e) => {
                      e.stopPropagation();
                      selectedContract = contract;
                      showActionMenu = !showActionMenu;
                    }"
                    class="text-blue-600 hover:text-blue-800"
                    title="Options"
                  >
                    <i class="fas fa-ellipsis-h text-sm"></i>
                  </button>

                  <!-- Menu déroulant -->
                  <div 
                    v-if="showActionMenu && selectedContract === contract"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                    @click.stop
                  >
                    <div class="py-1">
                      <button
                        @click="viewContract(contract)"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i class="fas fa-eye mr-2"></i>
                        Voir le contrat
                      </button>
                      <button
                        @click="editContract(contract)"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i class="fas fa-edit mr-2"></i>
                        Modifier
                      </button>
                      <button
                        @click="terminateContract(contract)"
                        class="block px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                      >
                        <i class="fas fa-times mr-2"></i>
                        Terminer le contrat
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="(e) => loadContracts(currentPage.value - 1)"
          :disabled="currentPage.value === 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <i class="fas fa-chevron-left"></i>
          Précédent
        </button>
        <button
          @click="(e) => loadContracts(currentPage.value + 1)"
          :disabled="currentPage.value === totalPages.value"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Suivant
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Page <span class="font-medium">{{ currentPage }}</span> sur <span class="font-medium">{{ totalPages }}</span>
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              @click="loadContracts(currentPage - 1)"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
              v-for="page in totalPages.value"
              :key="page"
              @click="(e) => loadContracts(page)"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                currentPage.value === page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              ]"
              :disabled="currentPage.value === page"
            >
              {{ page }}
            </button>
            <button
              @click="loadContracts(currentPage.value + 1)"
              :disabled="currentPage.value === totalPages.value"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'vue-toastification';
import { useRoute, useRouter } from 'vue-router';
import ContractService from '@/services/contract.service';
import type { Contract, ContractStatus, Property } from '@/types/contract';

export default {
  name: 'AgentContractsView',
  setup() {
    const authStore = useAuthStore();
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();

    // Réfs
    const contracts = ref<Contract[]>([]);
    const landlords = ref<any[]>([]);
    const loading = ref(false);
    const error = ref('');
    const showActionMenu = ref(false);
    const selectedContract = ref<Contract | null>(null);
    const currentPage = ref<number>(1);
    const totalPages = ref<number>(1);
    const searchQuery = ref('');
    const showCreateContract = ref(false);

    // Filtres
    const filters = ref({
      status: '' as ContractStatus,
      landlordId: ''
    });

    // Méthodes
    const loadContracts = async (page: number = 1) => {
      loading.value = true;
      error.value = '';
      currentPage.value = page;

      try {
        const response = await ContractService.getAgentContracts({
          page: page.toString(),
          status: filters.value.status,
          landlordId: filters.value.landlordId,
          search: searchQuery.value
        });

        if (response.success) {
          contracts.value = response.data;
          totalPages.value = Math.ceil(response.meta.total / 10); // Supposant 10 éléments par page
        } else {
          throw new Error('La requête a échoué');
        }
        
        // Charger la liste des bailleurs pour le filtre
        if (!landlords.value.length) {
          landlords.value = await ContractService.getLandlords();
        }
      } catch (err: any) {
        error.value = err.message || 'Une erreur est survenue lors de la récupération des contrats';
        toast.error(error.value);
      } finally {
        loading.value = false;
      }
    };

    const onSearchInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.value === '') {
        loadContracts();
      }
    };

    const viewContract = (contract: Contract) => {
      router.push({ name: 'agent-contract-details', params: { id: contract.id } });
    };

    const editContract = (contract: Contract) => {
      router.push({ name: 'agent-contract-edit', params: { id: contract.id } });
    };

    const terminateContract = async (contract: Contract) => {
      if (!confirm('Êtes-vous sûr de vouloir terminer ce contrat ?')) return;

      try {
        await ContractService.terminateContract(contract.id);
        toast.success('Le contrat a été terminé avec succès');
        loadContracts();
      } catch (err: any) {
        toast.error(err.message || 'Une erreur est survenue lors de la terminaison du contrat');
      }
    };

    // Formatage
    const formatDate = (date: string | number | Date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatCurrency = (amount: number, currency: string) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency
      }).format(amount);
    };

    const formatAddress = (address: any) => {
      if (!address) return '';
      return [
        address.street,
        address.postal_code && address.city ? `${address.postal_code} ${address.city}` : address.city,
        address.country
      ].filter(Boolean).join(', ');
    };

    const getStatusBadgeClass = (status: ContractStatus) => {
      const statusColors: Record<ContractStatus, string> = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        ended: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800',
        draft: 'bg-blue-100 text-blue-800'
      };
      return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status: ContractStatus) => {
      const statusLabels: Record<ContractStatus, string> = {
        active: 'Actif',
        pending: 'En attente',
        ended: 'Terminé',
        cancelled: 'Annulé',
        draft: 'Brouillon'
      };
      return statusLabels[status] || 'Inconnu';
    };

    // Lifecycle
    onMounted(() => {
      loadContracts();
    });

    return {
      contracts,
      landlords,
      loading,
      error,
      showActionMenu,
      selectedContract,
      currentPage,
      totalPages,
      searchQuery,
      filters,
      loadContracts,
      onSearchInput,
      viewContract,
      editContract,
      terminateContract,
      formatDate,
      formatCurrency,
      formatAddress,
      getStatusBadgeClass,
      getStatusLabel
    };
  }
};
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
