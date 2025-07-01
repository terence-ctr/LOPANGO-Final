<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
   
    
    <!-- Filtres et recherche -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-6 space-y-4 sm:space-y-0">
      <div class="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 w-full sm:w-auto">
        <i class="fas fa-filter"></i>
        <select v-model="filters.status" class="appearance-none bg-transparent focus:outline-none cursor-pointer">
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="pending">En attente</option>
          <option value="active">Actif</option>
          <option value="ended">Terminé</option>
          <option value="cancelled">Annulé</option>
        </select>
        <i class="fas fa-chevron-down text-xs"></i>
      </div>
      
      <div class="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 w-full sm:w-auto">
        <select class="appearance-none bg-transparent focus:outline-none cursor-pointer">
          <option>Colonnes</option>
        </select>
        <i class="fas fa-chevron-down text-xs"></i>
      </div>
      
      <input 
        v-model="searchQuery"
        type="search" 
        placeholder="Recherche..." 
        class="border border-gray-300 rounded-md px-3 py-1 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
      >
      
      <router-link 
        :to="{ name: 'landlord-contract-create' }" 
        class="ml-auto sm:ml-0 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold rounded-md px-4 py-2"
      >
        Ajouter
      </router-link>
    </div>
    
    <!-- Tableau des contrats -->
    <div class="overflow-x-auto border border-gray-200 rounded-md">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-3 text-left font-semibold text-gray-700 w-10" scope="col">#</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Propriété
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Conditions Spéciales
            </th>
            <th class="px-3 py-3 text-left font-semibold text-gray-700 min-w-[140px]" scope="col">
              Locataire
            </th>
            <th class="px-3 py-3 text-left font-semibold text-gray-700 min-w-[140px]" scope="col">
              Dates du contrat
            </th>
            <th class="px-3 py-3 text-left font-semibold text-gray-700 min-w-[100px]" scope="col">
              Statut
            </th>
            <th class="w-10" scope="col"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <!-- État de chargement -->
          <tr v-if="loading">
            <td colspan="7" class="px-3 py-4 text-center text-gray-500">Chargement des contrats...</td>
          </tr>
          
          <!-- Message d'erreur -->
          <tr v-else-if="error">
            <td colspan="7" class="px-3 py-4 text-center text-red-500">{{ error }}</td>
          </tr>
          
          <!-- Aucun résultat -->
          <tr v-else-if="filteredContracts.length === 0">
            <td colspan="7" class="px-3 py-4 text-center text-gray-500">
              Aucun contrat trouvé
            </td>
          </tr>
          
          <!-- Liste des contrats -->
          <tr v-for="(contract, index) in paginatedContracts" :key="contract.id" class="hover:bg-gray-50">
            <td class="px-3 py-2 text-gray-700 font-medium">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="contract.property" class="text-sm font-medium text-gray-900">
                {{ contract.property.title || 'Sans titre' }}
                <div v-if="contract.propertyId" class="text-xs text-gray-500">
                  ID: {{ contract.propertyId }}
                </div>
              </div>
              <div v-else class="text-sm text-gray-500">
                <span v-if="contract.propertyId">
                  Propriété #{{ contract.propertyId }} (détails manquants)
                </span>
                <span v-else>
                  Aucune propriété associée
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-700 max-w-xs truncate" :title="contract.specialConditions">
                {{ contract.specialConditions || 'Aucune condition spéciale' }}
              </div>
             
            </td>
            <td class="px-3 py-2">
              <div v-if="contract.tenant" class="flex flex-col">
               <span class="text-blue-600">
                  {{ contract.tenant.firstName }} {{ contract.tenant.lastName }}
                </span>
                <!-- Alternative: Utiliser une route existante si disponible -->
                <!--
                <router-link 
                  :to="{ name: 'tenant-details', params: { id: contract.tenant.id } }"
                  class="text-blue-600 hover:underline"
                >
                  {{ contract.tenant.firstName }} {{ contract.tenant.lastName }}
                </router-link>
                -->
              </div>
              <span v-else class="text-gray-400">Aucun locataire</span>
            </td>
            <td class="px-3 py-2 text-gray-500">
              {{ formatDate(contract.startDate) }} - {{ contract.endDate ? formatDate(contract.endDate) : 'Indéterminée' }}
            </td>
            <td class="px-3 py-2">
              <span :class="`font-semibold ${getStatusColor(contract.status)}`">
                {{ getStatusLabel(contract.status) }}
              </span>
            </td>
            <td class="px-3 py-2 relative text-center">
              <button
                aria-expanded="false"
                aria-haspopup="true"
                aria-label="Actions"
                class="text-gray-400 hover:text-gray-600 focus:outline-none"
                @click.stop="toggleMenu(contract.id)"
              >
                <i class="fas fa-ellipsis-h"></i>
              </button>
              <div
                v-if="openMenuId === contract.id"
                class="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-md shadow-lg text-xs z-10"
                role="menu"
              >
                <button
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-gray-700"
                  role="menuitem"
                  @click="viewContractDetails(contract)"
                >
                  <i class="fas fa-eye"></i> Voir détails
                </button>
                <button
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-gray-700"
                  role="menuitem"
                  @click="editContract(contract)"
                >
                  <i class="fas fa-pen"></i> Modifier
                </button>
                <button
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-500"
                  role="menuitem"
                  @click="openTerminationModal(contract)"
                >
                  <i class="fas fa-file-contract"></i> Rompre
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <footer v-if="!loading && !error && contracts.length > 0" class="flex items-center justify-between text-xs text-gray-500 mt-4">
      <div>
        {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredContracts.length) }} sur {{ filteredContracts.length }} éléments
      </div>
      <nav class="flex items-center space-x-2">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          :class="{'opacity-50 cursor-not-allowed': currentPage === 1}"
          class="p-1 hover:text-gray-900"
          aria-label="Page précédente"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <template v-for="page in totalPages" :key="page">
          <template v-if="page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2">
            <button 
              @click="currentPage = page"
              :class="{'bg-gray-200 text-gray-900 font-semibold': currentPage === page}"
              class="px-2 py-1 rounded hover:bg-gray-100"
            >
              {{ page }}
            </button>
          </template>
          <span 
            v-else-if="Math.abs(page - currentPage) === 3" 
            class="px-2 py-1"
          >
            ...
          </span>
        </template>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          :class="{'opacity-50 cursor-not-allowed': currentPage === totalPages}"
          class="p-1 hover:text-gray-900"
          aria-label="Page suivante"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </nav>
    </footer>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useContractStore } from '@/stores/contractStore';
import { useRouter } from 'vue-router';

// Fonction simple pour formater une date au format JJ/MM/AAAA
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR'); // Format français
  } catch (e) {
    console.error('Erreur de formatage de date:', e);
    return '';
  }
};

export default {
  name: 'ContractsView',
  
  setup() {
    // Stores et routeur
    const contractStore = useContractStore();
    const router = useRouter();
    
    // Références réactives
    const openMenuId = ref<number | string | null>(null);
    const showTerminationModal = ref(false);
    const selectedContract = ref<any>(null);
    const userAvatar = ref('https://ui-avatars.com/api/?name=Utilisateur');
    const loading = ref(true);
    const error = ref('');
    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 10;
    
    const filters = ref({
      status: ''
    });
    
    // Données calculées
    const contracts = computed(() => contractStore.contracts || []);
    
    const filteredContracts = computed(() => {
      if (!contracts.value || !Array.isArray(contracts.value)) {
        return [];
      }
      return contracts.value.filter(contract => {
        // Filtre par statut
        if (filters.value.status && contract.status !== filters.value.status) {
          return false;
        }
        
        // Filtre par recherche
        if (searchQuery.value) {
          const query = searchQuery.value.toLowerCase();
          const propertyTitle = contract.property?.title?.toLowerCase() || '';
          const tenantName = `${contract.tenant?.firstName || ''} ${contract.tenant?.lastName || ''}`.toLowerCase();
          const address = formatAddress(contract.property?.address).toLowerCase();
          
          if (!propertyTitle.includes(query) && 
              !tenantName.includes(query) && 
              !address.includes(query)) {
            return false;
          }
        }
        
        return true;
      });
    });
    
    const totalPages = computed(() => {
      return Math.ceil(filteredContracts.value.length / itemsPerPage);
    });
    
    const paginatedContracts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredContracts.value.slice(start, end);
    });
    
    // Charger les contrats
    const loadContracts = async () => {
      try {
        loading.value = true;
        error.value = '';
        await contractStore.fetchContracts();
        
        // Afficher les IDs des contrats dans la console
        console.log('=== LISTE DES CONTRATS ET LEURS PROPRIÉTÉS ===');
        if (contractStore.contracts && contractStore.contracts.length > 0) {
          contractStore.contracts.forEach((contract, index) => {
            console.log(`\nContrat #${index + 1} (ID: ${contract.id})`);
            console.log('  ID du contrat:', contract.id);
            console.log('  ID du propriétaire:', contract.landlordId);
            console.log('  ID du locataire:', contract.tenantId);
            console.log('  ID de la propriété:', contract.propertyId);
            
            if (contract.property) {
              console.log('  Propriété associée:');
              console.log('    ID:', contract.property.id);
              console.log('    Titre:', contract.property.title || 'Non spécifié');
              console.log('    Adresse:', contract.property.address || 'Non spécifiée');
              
              // Afficher la structure complète de la propriété
              console.log('    Détails complets:', JSON.stringify(contract.property, null, 2));
            } else {
              console.log('  Aucune propriété associée à ce contrat');
            }
            
            console.log('   ---'); // Séparateur entre les contrats
          });
        } else {
          console.log('Aucun contrat trouvé.');
        }
        console.log('=================================');
        
      } catch (err) {
        error.value = 'Erreur lors du chargement des contrats';
        console.error('Erreur:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // Formater une adresse (gère à la fois les chaînes et les objets d'adresse)
    const formatAddress = (address: string | { street: string; city?: string; postalCode?: string; country?: string; quartier?: string; commune?: string; } | null | undefined) => {
      if (!address) return 'Non spécifiée';
      
      // Si c'est déjà une chaîne, on la retourne telle quelle
      if (typeof address === 'string') return address;
      
      // Si c'est un objet, on construit l'adresse à partir des champs
      const parts = [
        address.street,
        address.quartier,
        address.commune,
        address.city,
        address.postalCode,
        address.country
      ].filter(Boolean);
      
      return parts.length > 0 ? parts.join(', ') : 'Adresse non spécifiée';
    };

    // Fonction pour basculer le menu déroulant
    const toggleMenu = (id: number | string | undefined) => {
      if (id === undefined) return;
      openMenuId.value = openMenuId.value === id ? null : id;
    };

    // Fonction pour ouvrir la modal de rupture
    const openTerminationModal = (contract: any) => {
      selectedContract.value = contract;
      showTerminationModal.value = true;
      openMenuId.value = null; // Fermer le menu déroulant
    };

    // Fonction pour fermer la modal
    const closeTerminationModal = () => {
      showTerminationModal.value = false;
      selectedContract.value = null;
    };

    // Fonction pour confirmer la rupture du contrat
    const confirmTermination = async () => {
      if (!selectedContract.value) return;
      
      try {
        // TODO: Implémenter la logique de rupture de contrat
        console.log('Rupture du contrat:', selectedContract.value.id);
        // Exemple : await contractStore.terminateContract(selectedContract.value.id);
        
        // Recharger les contrats
        await loadContracts();
        
        // Fermer la modal
        closeTerminationModal();
        
        // Afficher un message de succès
        // TODO: Remplacer par un système de notification
        alert('Le contrat a été rompu avec succès');
      } catch (error) {
        console.error('Erreur lors de la rupture du contrat:', error);
        // TODO: Afficher un message d'erreur
        alert('Une erreur est survenue lors de la rupture du contrat');
      }
    };

    // Fonctions de navigation
    const viewContractDetails = (contract: any) => {
      console.log('Voir les détails du contrat:', contract.id);
      // TODO: Implémenter la navigation vers la page de détails
      openMenuId.value = null;
    };

    const editContract = (contract: any) => {
      console.log('Modifier le contrat:', contract.id);
      // TODO: Implémenter la navigation vers la page d'édition
      openMenuId.value = null;
    };
    
    // Navigation de pagination
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };
    
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    // Fermer le menu déroulant lors d'un clic en dehors
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[aria-label="Actions"]') && !target.closest('[role="menu"]')) {
        openMenuId.value = null;
      }
    };

    // Hooks de cycle de vie
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      loadContracts();
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    // Réinitialiser la pagination lorsque les filtres changent
    watch([() => filters.value.status, searchQuery], () => {
      currentPage.value = 1;
    });

    // Couleur du statut
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active':
          return 'text-green-600';
        case 'pending':
          return 'text-yellow-600';
        case 'ended':
        case 'cancelled':
          return 'text-red-600';
        case 'draft':
          return 'text-gray-600';
        default:
          return 'text-gray-600';
      }
    };
    
    // Libellé du statut
    const getStatusLabel = (status: string) => {
      const statusLabels: Record<string, string> = {
        'draft': 'Brouillon',
        'pending': 'En attente',
        'active': 'Actif',
        'ended': 'Terminé',
        'cancelled': 'Annulé'
      };
      return statusLabels[status] || status;
    };

    // Exposer les propriétés nécessaires au template
    return {
      // Données
      contracts: paginatedContracts,
      filteredContracts,
      paginatedContracts,
      loading,
      error,
      searchQuery,
      currentPage,
      totalPages,
      itemsPerPage,
      filters,
      
      // Références
      openMenuId,
      showTerminationModal,
      selectedContract,
      userAvatar,
      
      // Méthodes
      formatDate,
      formatAddress,
      getStatusColor,
      getStatusLabel,
      toggleMenu,
      openTerminationModal,
      closeTerminationModal,
      confirmTermination,
      viewContractDetails,
      editContract,
      prevPage,
      nextPage,
      
      // Fonctions de navigation
      loadContracts
    };
  }
};
</script>

<style scoped>
/* Vous pouvez ajouter des styles spécifiques ici si nécessaire */
</style>
