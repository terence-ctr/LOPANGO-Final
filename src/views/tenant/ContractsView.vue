<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête avec titre et bouton d'action -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes contrats de location</h1>
        <p class="mt-1 text-sm text-gray-500">Consultez et gérez vos contrats de location</p>
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
          @change="loadContracts"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="pending">En attente</option>
          <option value="ended">Terminé</option>
          <option value="cancelled">Annulé</option>
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
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                <div class="flex justify-center items-center space-x-2">
                  <i class="fas fa-circle-notch fa-spin text-blue-600"></i>
                  <span>Chargement des contrats...</span>
                </div>
              </td>
            </tr>
            
            <!-- Message d'erreur -->
            <tr v-else-if="error">
              <td colspan="6" class="px-6 py-4 text-center text-red-500">
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
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
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
                      {{ contract.property_name || 'Propriété sans nom' }}
                    </div>
                    <div v-if="contract.property_address" class="text-xs text-gray-500 mt-1 max-w-xs truncate">
                      {{ contract.property_address }}
                    </div>
                    <div v-if="contract.property_status" class="mt-1">
                      <span :class="getStatusBadgeClass(contract.property_status)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                        {{ formatPropertyStatus(contract.property_status) }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              
              <!-- Bailleur -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="contract.landlord" class="text-sm text-gray-900">
                  {{ contract.landlord.firstName }} {{ contract.landlord.lastName }}
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
                  {{ formatCurrency(contract.rent) }}
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
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button 
                    @click="viewContract(contract.id)"
                    class="text-blue-600 hover:text-blue-900 mr-4"
                    title="Voir les détails"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    v-if="contract.status === 'active'"
                    @click="downloadContract(contract.id)"
                    class="text-gray-600 hover:text-gray-900"
                    title="Télécharger le contrat"
                  >
                    <i class="fas fa-download"></i>
                  </button>
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
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Précédent
        </button>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Suivant
        </button>
      </div>
      
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Affichage de <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
            à <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
            sur <span class="font-medium">{{ totalItems }}</span> résultats
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <!-- Flèche précédente -->
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              :class="{
                'opacity-50 cursor-not-allowed': currentPage === 1,
                'hover:bg-gray-50': currentPage > 1
              }"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500"
            >
              <span class="sr-only">Précédent</span>
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <!-- Numéros de page -->
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
            
            <!-- Flèche suivante -->
            <button 
              @click="currentPage++" 
              :disabled="currentPage === totalPages"
              :class="{
                'opacity-50 cursor-not-allowed': currentPage === totalPages,
                'hover:bg-gray-50': currentPage < totalPages
              }"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500"
            >
              <span class="sr-only">Suivant</span>
              <i class="fas fa-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { Contract, ContractStatus } from '@/types/contract';
import { useRouter } from 'vue-router';
import { useContractStore } from '@/stores/contractStore';

export default {
  name: 'TenantContractsView',
  
  setup() {
    const router = useRouter();
    const contractStore = useContractStore();
    
    // État réactif
    const loading = ref(false);
    const error = ref<string | null>(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const searchQuery = ref('');
    const searchTimeout = ref<number | null>(null);
    
    // Filtres
    const filters = ref({
      status: '',
      // Ajoutez d'autres filtres si nécessaire
    });
    
    // Charger les contrats
    const loadContracts = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        // Appel à l'API pour récupérer les contrats du locataire
        await contractStore.fetchContracts();
        
      } catch (err) {
        console.error('Erreur lors du chargement des contrats:', err);
        error.value = 'Impossible de charger les contrats. Veuillez réessayer plus tard.';
      } finally {
        loading.value = false;
      }
    };
    
    // Gestion de la recherche avec debounce
    const onSearchInput = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }
      
      searchTimeout.value = window.setTimeout(() => {
        currentPage.value = 1; 
        loadContracts();
      }, 500);
    };
    
    // Formater une date au format JJ/MM/AAAA
    const formatDate = (dateString: string) => {
      if (!dateString) return 'Non spécifié';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };
    
    // Formater le statut de la propriété pour l'affichage
    const formatPropertyStatus = (status: string): string => {
      const statusMap: Record<string, string> = {
        'draft': 'Brouillon',
        'pending': 'En attente',
        'active': 'Actif',
        'inactive': 'Inactif',
        'rented': 'Loué',
        'available': 'Disponible',
        'maintenance': 'En maintenance',
        'ended': 'Terminé',
        'cancelled': 'Annulé'
      };
      return statusMap[status.toLowerCase()] || status;
    };

    // Classe CSS pour les badges de statut
    const getStatusBadgeClass = (status: string): string => {
      const statusClasses: Record<string, string> = {
        'draft': 'bg-gray-100 text-gray-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-gray-100 text-gray-600',
        'rented': 'bg-blue-100 text-blue-800',
        'available': 'bg-green-100 text-green-800',
        'maintenance': 'bg-red-100 text-red-800',
        'ended': 'bg-gray-100 text-gray-600',
        'cancelled': 'bg-red-100 text-red-800'
      };
      return statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    // Formater un montant en euros
    const formatCurrency = (amount: number) => {
      if (amount === undefined || amount === null) return 'N/A';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
      }).format(amount);
    };
    
    // Formater une adresse à partir d'une chaîne ou d'un objet d'adresse
    const formatAddress = (address: string | {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
      property_address_street?: string;
      property_address_city?: string;
      property_address_postal_code?: string;
      property_address_country?: string;
    } | undefined) => {
      if (!address) return 'Adresse non disponible';
      
      // Si l'adresse est une chaîne, on la retourne telle quelle
      if (typeof address === 'string') return address;
      
      // Sinon, on gère l'objet d'adresse
      const street = address.street || address.property_address_street || '';
      const city = address.city || address.property_address_city || '';
      const postalCode = address.postalCode || address.property_address_postal_code || '';
      const country = address.country || address.property_address_country || '';
      
      const parts = [street, postalCode, city, country].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Adresse non disponible';
    };
    
    // Obtenir le libellé du statut
    const getStatusLabel = (status: ContractStatus) => {
      const statusLabels: Record<string, string> = {
        'draft': 'Brouillon',
        'pending': 'En attente',
        'active': 'Actif',
        'ended': 'Terminé',
        'cancelled': 'Annulé',
        'renewed': 'Renouvelé',
        'terminated': 'Résilié',
        'expired': 'Expiré'
      };
      
      return statusLabels[status] || status;
    };
    
    // Navigation vers la page de détail d'un contrat
    const viewContract = (contractId: string | number | undefined) => {
      if (contractId === undefined) return;
      const id = typeof contractId === 'number' ? contractId : Number(contractId);
      if (!isNaN(id)) {
        router.push({ name: 'tenant-contract-detail', params: { id: String(id) } });
      }
    };
    

    // Télécharger un contrat
    const downloadContract = (contractId: string | number | undefined) => {
      if (contractId === undefined) return;
      // Implémentez la logique de téléchargement ici
      console.log('Téléchargement du contrat:', contractId);
      // Exemple: contractStore.downloadContract(contractId);
    };
    
    // Calcul des propriétés dérivées
    const contracts = computed(() => contractStore.contracts);
    const totalItems = computed(() => contractStore.contracts.length);
    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
    

    // Observer les changements de page
    watch(currentPage, () => {
      loadContracts();
      // Faire défiler vers le haut de la page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Observer les changements de filtres
    watch(() => filters.value, () => {
      currentPage.value = 1; // Réinitialiser à la première page lors du changement de filtre
      loadContracts();
    }, { deep: true });
    
    // Charger les contrats au montage du composant
    onMounted(() => {
      loadContracts();
    });
    
    // Nettoyer le timeout lors du démontage du composant
    onUnmounted(() => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }
    });
    
    return {
      // État
      loading,
      error,
      currentPage,
      itemsPerPage,
      searchQuery,
      filters,
      
      // Données
      contracts,
      totalItems,
      totalPages,
      
      // Méthodes
      loadContracts,
      onSearchInput,
      formatAddress,
      formatDate,
      formatCurrency,
      getStatusBadgeClass,
      getStatusLabel,
      formatPropertyStatus,
      viewContract,
      downloadContract
    };
  }
};
</script>

<style scoped>
/* Styles spécifiques au composant */
.contract-card {
  transition: all 0.2s ease-in-out;
}

.contract-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Animation de chargement */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
