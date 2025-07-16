<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Gestion des contrats</h1>
      <router-link to="/landlord/contracts/add" class="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        Ajouter un contrat
      </router-link>
    </div>

    <!-- Filtres et recherche -->
    <div class="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i class="fas fa-search text-gray-400"></i>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Rechercher un contrat..."
        />
      </div>

      <select
        v-model="statusFilter"
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="">Tous les statuts</option>
        <option value="active">Actif</option>
        <option value="pending">En attente</option>
        <option value="terminated">Résilié</option>
        <option value="expired">Expiré</option>
      </select>
    </div>

    <!-- Tableau des contrats -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Locataire
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propriété
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
              <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                Chargement des contrats...
              </td>
            </tr>

            <!-- Message si aucun contrat trouvé -->
            <tr v-else-if="!loading && filteredContracts.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                Aucun contrat trouvé
              </td>
            </tr>

            <!-- Liste des contrats -->
            <tr v-for="contract in filteredContracts" :key="contract._id" class="hover:bg-gray-50">
              <!-- Colonne Locataire -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ formatTenantName(contract.tenantId) }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Colonne Agent -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                  <template v-if="agentNames[contract._id]">
                    {{ agentNames[contract._id] }}
                  </template>
                  <template v-else-if="contract.agent">
                    {{ contract.agent.firstName || '' }} {{ contract.agent.lastName || '' }}
                    <div v-if="!contract.agent.firstName && !contract.agent.lastName" class="text-xs text-red-500">
                      (Agent sans nom)
                    </div>
                  </template>
                  <template v-else>
                    Aucun agent
                    <div class="text-xs text-gray-400">
                      ID: {{ contract.agent_id || contract.agentId || 'Aucun ID' }}
                    </div>
                  </template>
                </div>
              </td>

              <!-- Colonne Propriété -->
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ contract.property?.title || 'Propriété non spécifiée' }}
                </div>
                <div v-if="contract.property?.address" class="text-sm text-gray-500">
                  {{ formatAddress(contract.property.address) }}
                </div>
              </td>

              <!-- Colonne Période -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  Du {{ formatDate(contract.startDate) }}
                </div>
                <div class="text-sm text-gray-500">
                  au {{ formatDate(contract.endDate) || 'Indéfinie' }}
                </div>
              </td>

              <!-- Colonne Loyer -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 font-medium">
                  {{ formatCurrency(contract.rent) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ contract.paymentFrequency || 'Non spécifié' }}
                </div>
              </td>

              <!-- Colonne Statut -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusBadgeClass(contract.status)" 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getStatusLabel(contract.status) }}
                </span>
              </td>

              <!-- Colonne Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="relative">
                  <button 
                    @click="contract._id ? toggleActions(contract._id) : null"
                    class="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <i class="fas fa-ellipsis-h"></i>
                  </button>
                  
                  <!-- Menu déroulant des actions -->
                  <div 
                    v-if="openActionsId === contract._id"
                    class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    tabindex="-1"
                    @click.stop
                  >
                    <div class="py-1" role="none">
                      <button
                        @click="viewContract(contract)"
                        class="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        role="menuitem"
                      >
                        <i class="far fa-eye mr-2"></i>Voir les détails
                      </button>
                      <button
                        @click="editContract(contract)"
                        class="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        role="menuitem"
                      >
                        <i class="far fa-edit mr-2"></i>Modifier
                      </button>
                      <button
                        v-if="contract.status === 'active'"
                        @click.stop="openTerminationModal(contract, $event)"
                        class="text-red-600 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        role="menuitem"
                      >
                        <i class="fas fa-times-circle mr-2"></i>Résilier
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
    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Affichage de <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> à 
        <span class="font-medium">
          {{ Math.min(currentPage * itemsPerPage, filteredContracts.length) }}
        </span> sur <span class="font-medium">{{ filteredContracts.length }}</span> résultats
      </div>
      
      <div class="flex space-x-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          :class="{
            'opacity-50 cursor-not-allowed': currentPage === 1,
            'hover:bg-gray-100': currentPage > 1
          }"
          class="px-3 py-1 border border-gray-300 rounded text-sm font-medium"
        >
          Précédent
        </button>
        <button
          @click="nextPage"
          :disabled="currentPage * itemsPerPage >= filteredContracts.length"
          :class="{
            'opacity-50 cursor-not-allowed': currentPage * itemsPerPage >= filteredContracts.length,
            'hover:bg-gray-100': currentPage * itemsPerPage < filteredContracts.length
          }"
          class="px-3 py-1 border border-gray-300 rounded text-sm font-medium"
        >
          Suivant
        </button>
      </div>
    </div>

    <!-- Modal de résiliation -->
    <teleport to="body">
      <div v-if="showTerminationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]" @click.self="closeTerminationModal">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Résilier le contrat</h3>
              <button @click="closeTerminationModal" class="text-gray-400 hover:text-gray-500">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="mb-6">
              <p class="text-sm text-gray-600 mb-4">
                Êtes-vous sûr de vouloir résilier ce contrat ? Cette action est irréversible.
              </p>
              
              <div class="mb-4">
                <label for="terminationDate" class="block text-sm font-medium text-gray-700 mb-1">
                  Date de résiliation
                </label>
                <input
                  type="date"
                  id="terminationDate"
                  v-model="terminationDate"
                  :min="formatDateForInput(new Date())"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div class="mb-4">
                <label for="terminationReason" class="block text-sm font-medium text-gray-700 mb-1">
                  Raison de la résiliation (optionnel)
                </label>
                <textarea
                  id="terminationReason"
                  v-model="terminationReason"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Décrivez la raison de la résiliation..."
                ></textarea>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                @click="closeTerminationModal"
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Annuler
              </button>
              <button
                @click="confirmTermination"
                type="button"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Confirmer la résiliation
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, watchEffect, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useContractStore } from '@/stores/contractStore';
import { useAuthStore } from '@/stores/authStore';
import { useTenantStore } from '@/stores/tenantStore';
import { useAgentStore } from '@/stores/agentStore';
import type { ContractStatus as ContractStatusType } from '@/types/contract';

// Types
type ContractStatus = ContractStatusType | string; // Permettre les chaînes personnalisées

interface PropertyAddress {
  street: string;
  city: string;
  postal_code: string;
  country: string;
  full_address?: string;
}

interface PropertyType {
  _id?: string;
  id?: string | number;
  name?: string;
  title: string;
  description?: string;
  [key: string]: any;
}

interface Property {
  id?: string | number;  // Made optional to match the data structure
  title: string;
  description?: string;
  address: string | PropertyAddress;
  agent_id?: string | number;
  status?: string;
  type: string | PropertyType;  // Peut être une chaîne ou un objet
  furnished?: boolean; // Rendre ce champ optionnel
  [key: string]: any; // Pour les propriétés supplémentaires
}

interface BaseContract {
  // Identifiants
  _id: string;
  id: string | number;
  
  // Références
  tenantId: string | number;
  tenant_id?: string | number;
  tenant?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
  };
  landlordId: string | number;
  landlord_id?: string | number;
  propertyId: string | number;
  property_id?: string | number;
  
  // Dates
  startDate: string;
  start_date?: string;
  endDate: string | null;  // Peut être null pour les contrats à durée indéterminée
  end_date?: string | null;
  
  // Informations financières
  rent: number;
  deposit: number;
  deposit_status: string;  // Peut être 'paid', 'unpaid', 'partial', etc.
  currency?: string;
  paymentFrequency?: string;
  
  // Statut et métadonnées
  status: ContractStatus;
  duration?: string;
  special_conditions?: string;
  payment_day?: number | null;
  
  // Agent
  agent?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
  };
  agent_id?: string | number;
  
  // Métadonnées
  created_at?: string | number;
  updated_at?: string | number;
  [key: string]: any;
}

interface Contract extends Omit<BaseContract, 'property'> {
  // Propriétés spécifiques à l'interface Contract
  property?: Property | null;
  agent?: Agent | null;
  agentId?: string | number | null;
  agent_id?: string | number | null;
  [key: string]: any;
}

interface Agent {
  id: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: any;
}

// Props et émetteurs
const router = useRouter();

// Stores
const contractStore = useContractStore();
const authStore = useAuthStore();
const tenantStore = useTenantStore();
const agentStore = useAgentStore();

// Méthode pour afficher les IDs des agents
const logAgentIds = () => {
  if (!contractStore.contracts || contractStore.contracts.length === 0) {
    console.log('Aucun contrat chargé');
    return;
  }
  
  console.log('=== IDENTIFIANTS DES AGENTS PAR CONTRAT ===');
  contractStore.contracts.forEach(contract => {
    const contractId = contract._id || contract.id;
    const agentId = contract.agent_id || contract.agentId || 
                   (contract.agent ? (contract.agent._id || contract.agent.id) : null);
    
    console.log(`Contrat ID: ${contractId}`, {
      agentId: agentId,
      hasAgentObject: !!contract.agent,
      agentObject: contract.agent || 'Aucun objet agent',
      agentInStore: agentId ? agentStore.getAgentById(agentId) : 'Aucun ID d\'agent'
    });
  });
};

// Chargement des données au montage et initialisation des écouteurs
onMounted(async () => {
  // Initialiser les écouteurs d'événements
  document.addEventListener('click', handleClickOutside);
  localLoading.value = true;

  try {
    console.log('Début du chargement des données...');
    
    // Charger d'abord les agents
    console.log('Chargement des agents...');
    await agentStore.fetchAgents();
    console.log('Agents chargés:', agentStore.agents);
    
    // Puis charger les contrats et les locataires en parallèle
    await Promise.all([
      tenantStore.fetchTenants(),
      contractStore.fetchContracts()
    ]);
    
    console.log('Données chargées:', {
      locataires: tenantStore.tenants.length,
      agents: agentStore.agents.length,
      contrats: contractStore.contracts.length
    });
    
    // Afficher les IDs des agents pour le débogage
    logAgentIds();
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  } finally {
    localLoading.value = false;
  }
});

// Nettoyer les écouteurs d'événements lors du démontage du composant
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Fonctions utilitaires
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// États et réactifs
const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const openActionsId = ref<string | null>(null);
const showTerminationModal = ref(false);
const terminationReason = ref('');
const terminationDate = ref(formatDateForInput(new Date()));
const selectedContractId = ref<string | null>(null);
const localLoading = ref(false);
const agentNames = ref<Record<string, string>>({});

// Propriété computed pour l'état de chargement global
const isLoading = computed(() => localLoading.value || contractStore.loading);

// Alias pour la compatibilité avec le code existant
const loading = computed(() => isLoading.value);

// Propriétés calculées
const contracts = computed(() => contractStore.contracts || []);

const filteredContracts = computed(() => {
  if (!contracts.value) return [];
  
  let result = [...contracts.value];
  
  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(contract => {
      const tenantName = formatTenantName(contract.tenantId).toLowerCase();
      const propertyTitle = contract.property?.title?.toLowerCase() || '';
      const address = formatAddress(contract.property?.address).toLowerCase();
      
      return tenantName.includes(query) || 
             propertyTitle.includes(query) || 
             address.includes(query);
    });
  }
  
  // Filtrage par statut
  if (statusFilter.value) {
    result = result.filter(contract => contract.status === statusFilter.value);
  }
  
  return result;
});

const paginatedContracts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredContracts.value.slice(start, end);
});

// Fonctions utilitaires
const formatDate = (dateString: string | number | Date | null | undefined): string => {
  if (!dateString) return 'Non spécifiée';
  
  try {
    const date = typeof dateString === 'string' || typeof dateString === 'number' 
      ? new Date(dateString) 
      : dateString;
      
    if (isNaN(date.getTime())) return 'Date invalide';
    
    return format(date, 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return 'Date invalide';
  }
};

const formatAddress = (address: any): string => {
  if (!address) return 'Adresse non spécifiée';
  if (typeof address === 'string') return address;
  
  const parts = [];
  if (address.street) parts.push(address.street);
  
  const postalCode = address.postal_code || address.postalCode;
  if (postalCode || address.city) {
    parts.push([postalCode, address.city].filter(Boolean).join(' '));
  }
  
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const getStatusBadgeClass = (status: string): string => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    ended: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    draft: 'bg-blue-100 text-blue-800'
  };
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string): string => {
  const labels = {
    active: 'Actif',
    pending: 'En attente',
    ended: 'Terminé',
    cancelled: 'Annulé',
    draft: 'Brouillon'
  };
  return labels[status as keyof typeof labels] || status;
};

const formatTenantName = (tenantId: string | number): string => {
  const tenant = tenantStore.tenants.find(t => String(t._id) === String(tenantId));
  if (!tenant) return 'Locataire inconnu';
  return `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || 'Locataire sans nom';
};

const formatAgentName = async (contract: Contract): Promise<string> => {
  if (!contract) {
    console.log('Aucun contrat fourni');
    return 'Aucun agent';
  }
  
  console.log('Contrat:', {
    id: contract._id || contract.id,
    hasAgentProperty: !!contract.agent,
    agentId: contract.agent_id || contract.agentId,
    agentObject: contract.agent
  });
  
  // Vérifier si l'agent est déjà dans le contrat avec des informations complètes
  if (contract.agent) {
    const name = `${contract.agent.firstName || ''} ${contract.agent.lastName || ''}`.trim();
    if (name) {
      console.log('Nom de l\'agent trouvé dans le contrat:', name);
      return name;
    }
  }
  
  // Récupérer l'ID de l'agent depuis différentes sources possibles
  const agentId = contract.agent_id || contract.agentId || 
                 (contract.agent ? (contract.agent._id || contract.agent.id) : null);
  
  console.log('ID de l\'agent extrait:', agentId);
  
  if (!agentId) {
    console.log('Aucun ID d\'agent trouvé dans le contrat');
    return 'Aucun agent';
  }
  
  try {
    // Essayer de récupérer l'agent depuis le store
    const agentFromStore = agentStore.getAgentById(agentId);
    
    // Si l'agent est dans le store, le retourner
    if (agentFromStore) {
      const name = `${agentFromStore.firstName || ''} ${agentFromStore.lastName || ''}`.trim();
      console.log('Agent trouvé dans le store:', name);
      return name || 'Agent sans nom';
    }
    
    console.log('Agent non trouvé dans le store, tentative de chargement...');
    
    // Si l'agent n'est pas dans le store, essayer de le charger
    const fetchedAgent = await agentStore.fetchAgentById(agentId);
    
    if (fetchedAgent) {
      const name = `${fetchedAgent.firstName || ''} ${fetchedAgent.lastName || ''}`.trim();
      console.log('Agent chargé avec succès:', name);
      return name || 'Agent sans nom';
    }
    
    console.log(`Aucun agent trouvé avec l'ID: ${agentId}`);
    return `Agent #${agentId}`;
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'agent:', error);
    return 'Erreur de chargement';
  }
};

// Gestion des actions
const toggleActions = (contractId: string | null) => {
  openActionsId.value = openActionsId.value === contractId ? null : contractId;
};

const viewContract = (contract: Contract) => {
  if (contract._id) {
    router.push(`/landlord/contracts/${contract._id}`);
  }
};

const editContract = (contract: Contract) => {
  if (contract._id) {
    router.push(`/landlord/contracts/${contract._id}/edit`);
  }
};

const openTerminationModal = (contract: Contract, event: Event) => {
  event.stopPropagation();
  openActionsId.value = null; // Fermer le menu déroulant
  selectedContractId.value = contract._id ? String(contract._id) : null;
  terminationDate.value = formatDateForInput(new Date());
  terminationReason.value = '';
  showTerminationModal.value = true;
};

const closeTerminationModal = () => {
  showTerminationModal.value = false;
  selectedContractId.value = null;
  terminationReason.value = '';
  // Réinitialiser la date de résiliation à aujourd'hui
  terminationDate.value = formatDateForInput(new Date());
};

const confirmTermination = async () => {
  if (!selectedContractId.value) return;
  
  try {
    await contractStore.updateContractStatus(selectedContractId.value, 'cancelled');
    closeTerminationModal();
    // Rafraîchir la liste des contrats
    await contractStore.fetchContracts();
  } catch (error) {
    console.error('Erreur lors de la résiliation du contrat:', error);
  }
};

// Pagination
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value * itemsPerPage < filteredContracts.value.length) {
    currentPage.value++;
  }
};

// Mettre à jour les noms des agents lorsque les contrats changent
watch(contracts, async (newContracts) => {
  if (!newContracts) return;
  
  console.log('=== MISE À JOUR DES NOMS D\'AGENTS ===');
  console.log('Contrats reçus:', newContracts.length);
  
  const updates: Record<string, string> = {};
  
  for (const contract of newContracts) {
    if (contract?._id) {
      console.log(`Traitement du contrat ${contract._id}:`, {
        hasAgent: !!contract.agent,
        agentId: contract.agent_id || contract.agentId,
        agentData: contract.agent
      });
      
      if (!agentNames.value[contract._id]) {
        try {
          const name = await formatAgentName(contract);
          updates[contract._id] = name;
          console.log(`Nom d'agent pour le contrat ${contract._id}:`, name);
        } catch (error) {
          console.error('Erreur lors du formatage du nom de l\'agent:', error);
          updates[contract._id] = 'Erreur de chargement';
        }
      }
    }
  }
  
  // Mise à jour unique de l'état
  if (Object.keys(updates).length > 0) {
    console.log('Mise à jour des noms d\'agents:', updates);
    agentNames.value = {
      ...agentNames.value,
      ...updates
    };
  } else {
    console.log('Aucune mise à jour de noms d\'agents nécessaire');
  }
}, { immediate: true, deep: true });

// Gestionnaire de clic en dehors du menu déroulant
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.actions-menu') && !target.closest('.actions-button')) {
    openActionsId.value = null;
  }
};



// Mettre à jour l'état de chargement local lors du chargement initial
watchEffect(() => {
  if (contractStore.loading) {
    localLoading.value = true;
  } else {
    // Délai pour éviter les clignotements pendant le chargement
    const timer = setTimeout(() => {
      localLoading.value = false;
    }, 300);
    
    return () => clearTimeout(timer);
  }
});

// Nettoyage
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Styles spécifiques au composant */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content {
  max-height: 90vh;
  overflow-y: auto;
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    margin: 0 auto;
  }
}
</style>
