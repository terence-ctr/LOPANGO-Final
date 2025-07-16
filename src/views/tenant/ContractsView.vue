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
                Adresse
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
                      {{ contract.property_name || 'Propriété sans nom' }}
                    </div>
                  
                  </div>
                </div>
              </td>
              
              <!-- Adresse -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  {{ formatAddress(contract.property_address) }}
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
                  {{ formatCurrency(contract.rent, normalizeCurrency(contract.currency)) }}
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
                        @click="viewContract(contract.id)"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <i class="fas fa-eye mr-2"></i>
                        Voir
                      </button>
                      <button 
                        v-if="contract.status === 'active'"
                        @click="downloadContract(contract.id)"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <i class="fas fa-download mr-2"></i>
                        Télécharger
                      </button>
                      <div v-if="contract.status === 'active'" class="border-t border-gray-200 my-1"></div>
                      <button 
                        v-if="contract.status === 'active'"
                        @click="terminateContract(contract.id)"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <i class="fas fa-times mr-2"></i>
                        Rompre
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
import { useToast } from 'vue-toastification';

// Fonction pour corriger l'encodage des caractères spéciaux
const fixEncoding = (text: string): string => {
  return text
    .replace(/Ã©/g, 'é')
    .replace(/Ã¨/g, 'è')
    .replace(/Ãª/ig, 'ê')
    .replace(/Ã«/g, 'ë')
    .replace(/Ã®/g, 'î')
    .replace(/Ã¯/g, 'ï')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã³/ig, 'ó')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã¼/ig, 'ü')
    .replace(/Ã§/g, 'ç');
};

// Normaliser le nom d'une devise
const normalizeCurrency = (currency: string): string => {
  if (!currency) return 'EUR';
  
  const normalized = fixEncoding(currency.toLowerCase().trim());
  
  // Mappage des devises
  const currencyMap: Record<string, string> = {
    'euros': 'EUR',
    'euro': 'EUR',
    '€': 'EUR',
    'dollars': 'USD',
    'dollar': 'USD',
    'usd': 'USD',
    '$': 'USD',
    'us dollar': 'USD',
    'us dollars': 'USD',
    'dollars amÃ©ricain': 'USD',
    'dollars amÃ©ricains': 'USD'
  };
  
  // Vérifier si le code de devise est valide
  const validCurrencies = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'];
  const normalizedCode = normalized.toUpperCase();
  
  if (validCurrencies.includes(normalizedCode)) {
    return normalizedCode;
  }
  
  // Utiliser la valeur mappée ou EUR par défaut
  return currencyMap[normalized] || 'EUR';
};

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
    const activeDropdown = ref<string | null>(null);
    
    // Filtres de recherche
    const filters = ref({
      status: null as ContractStatus | null,
      search: ''
    });

    // Référence pour le menu déroulant
    const showActionMenu = ref(false);
    const selectedContract = ref<Contract | null>(null);
    const selectedStatus = ref<ContractStatus | null>(null);
    const selectedSort = ref<string>('startDate');
    
    // État de la pagination

    // Fermer le menu déroulant lors d'un clic en dehors
    const handleOutsideClick = (event: MouseEvent) => {
      if (!showActionMenu.value) return;
      
      const menu = document.querySelector('.z-50');
      const button = event.target as HTMLElement;
      
      // Vérifier si le clic est sur le bouton de menu
      const isMenuButton = button.closest('.text-blue-600');
      
      if (menu && !menu.contains(event.target as Node) && !isMenuButton) {
        showActionMenu.value = false;
        selectedContract.value = null;
      }
    };

    // Fermer le menu déroulant lors d'une touche d'échappement
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showActionMenu.value) {
        showActionMenu.value = false;
        selectedContract.value = null;
      }
    };

    // Gestion des événements de clic et de touche
    onMounted(() => {
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
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
    const onSearchInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }
      
      searchTimeout.value = window.setTimeout(() => {
        filters.value.search = value;
        loadContracts();
      }, 300);
    };

    // Gestion du filtre par statut
    const handleStatusFilter = (status: ContractStatus | null) => {
      selectedStatus.value = status;
      loadContracts();
    };

    // Gestion du tri
    const handleSortChange = (field: string) => {
      selectedSort.value = field;
      loadContracts();
    };

    // Gestion de la pagination
    const handlePageChange = (page: number) => {
      currentPage.value = page;
      loadContracts();
    };

    // Gestion du nombre d'éléments par page
    const handlePageSizeChange = (size: number) => {
      itemsPerPage.value = size;
      loadContracts();
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

    // Normaliser le nom d'une devise
    const normalizeCurrency = (currency: string): string => {
      if (!currency) return 'EUR';
      
      const normalized = currency.toLowerCase().trim();
      
      // Mappage des devises
      const currencyMap: Record<string, string> = {
        'euros': 'EUR',
        'euro': 'EUR',
        '€': 'EUR',
        'dollars': 'USD',
        'dollar': 'USD',
        'usd': 'USD',
        '$': 'USD',
        'us dollar': 'USD',
        'us dollars': 'USD',
        'dollars amÃ©ricain': 'USD', // Gestion du cas spécifique avec encodage incorrect
        'dollars amÃ©ricains': 'USD'
      };
      
      // Vérifier si le code de devise est valide
      const validCurrencies = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'];
      const normalizedCode = normalized.toUpperCase();
      
      if (validCurrencies.includes(normalizedCode)) {
        return normalizedCode;
      }
      
      // Utiliser la valeur mappée ou EUR par défaut
      return currencyMap[normalized] || 'EUR';
    };

    // Formater un montant avec la devise appropriée
    const formatCurrency = (amount: number, currency: string = 'EUR') => {
      if (amount === undefined || amount === null) return 'N/A';
      
      try {
        const normalizedCurrency = normalizeCurrency(currency);
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: normalizedCurrency,
          minimumFractionDigits: 2
        }).format(amount);
      } catch (error) {
        console.error('Erreur lors de la formatage du montant:', error);
        return 'N/A';
      }
    };
    
    // Formater une adresse à partir d'une chaîne ou d'un objet d'adresse
    const formatAddress = (address: string | {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    } | undefined) => {
      if (typeof address === 'string') {
        return address;
      }

      const { street, city, postalCode, country } = address || {};
      
      return `${street}${street && (city || postalCode) ? ', ' : ''}${city}${city && postalCode ? ' ' : ''}${postalCode}${country ? ', ' + country : ''}`.trim();
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
      if (!contractId) return;
      router.push({ name: 'tenant-contract-detail', params: { id: String(contractId) } });
    };

    // Méthode pour télécharger un contrat
    const downloadContract = async (contractId: string | number | undefined) => {
      if (!contractId) return;
      
      try {
        loading.value = true;
        const url = await contractStore.generateContractPdf(String(contractId));
        window.open(url, '_blank');
        const toast = useToast();
        toast.success('PDF du contrat ouvert dans un nouvel onglet');
      } catch (error: any) {
        console.error('Erreur lors du téléchargement du contrat:', error);
        const toast = useToast();
        const errorMessage = error?.response?.data?.message || error.message || 'Erreur lors du téléchargement du contrat';
        toast.error(fixEncoding(errorMessage));
      } finally {
        loading.value = false;
      }
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
    
    // Méthode pour rompre un contrat
    const terminateContract = async (contractId: string | number | undefined) => {
      try {
        const confirmed = window.confirm('Êtes-vous sûr de vouloir rompre ce contrat ? Cette action est irréversible.');
        if (!confirmed) return;

        await contractStore.updateContractStatus(String(contractId), 'terminated' as ContractStatus);
        await loadContracts();
        const toast = useToast();
        toast.success('Contrat rompu avec succès');
      } catch (error) {
        console.error('Erreur lors de la rupture du contrat:', error);
        const toast = useToast();
        toast.error('Erreur lors de la rupture du contrat');
      }
    };

    return {
      contracts,
      loading,
      error,
      currentPage,
      itemsPerPage,
      totalPages,
      searchQuery,
      selectedStatus,
      selectedSort,
      filters,
      viewContract,
      downloadContract,
      terminateContract,
      loadContracts,
      getStatusLabel,
      getStatusBadgeClass,
      formatDate,
      formatCurrency,
      formatAddress,
      normalizeCurrency,
      onSearchInput,
      handleStatusFilter,
      handleSortChange,
      handlePageChange,
      handlePageSizeChange,
      showActionMenu,
      selectedContract,
      handleOutsideClick,
      handleEscape,
      totalItems
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
