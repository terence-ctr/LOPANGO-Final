<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Gestion des locataires</h1>
      <button 
        @click="loadTenants"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        :disabled="loading"
      >
        <i class="fas fa-sync mr-2" :class="{'fa-spin': loading}"></i>
        Actualiser
      </button>
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
          placeholder="Rechercher un locataire..."
          :disabled="loading"
        />
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1 overflow-auto">
      <div class="py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 class="text-2xl font-semibold text-gray-900">Locataires avec contrats</h1>
          <p class="mt-1 text-sm text-gray-500">
            Liste des locataires ayant signé un contrat de location
          </p>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <!-- Barre de recherche -->
          <div class="py-4">
            <div class="relative flex-1 max-w-md">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-search text-gray-400"></i>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Rechercher un locataire..."
              />
            </div>
          </div>

          <!-- Tableau des locataires avec contrats -->
          <div class="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom complet
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nationalité
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pièce d'identité
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <!-- État de chargement -->
                  <tr v-if="loading">
                    <td colspan="5" class="px-6 py-4 text-center">
                      <div class="flex justify-center">
                        <i class="fas fa-circle-notch fa-spin text-blue-500"></i>
                      </div>
                    </td>
                  </tr>

                  <!-- Message d'erreur -->
                  <tr v-else-if="error">
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-red-600">
                      {{ error }}
                    </td>
                  </tr>

                  <!-- Message si aucun locataire trouvé -->
                  <tr v-else-if="!loading && tenantsWithContracts.length === 0">
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                      Aucun locataire avec contrat trouvé
                    </td>
                  </tr>

                  <!-- Liste des locataires avec contrats -->
                  <tr 
                    v-for="tenant in tenantsWithContracts" 
                    :key="tenant.id" 
                    class="hover:bg-gray-50"
                  >
                    <!-- Colonne Nom complet -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                          <i class="fas fa-user text-blue-600"></i>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ tenant.fullName }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Colonne Email -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ tenant.email || 'Non renseigné' }}</div>
                    </td>

                    <!-- Colonne Téléphone -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ getTenantPhone(tenant.id) }}</div>
                    </td>

                    <!-- Colonne Nationalité -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ getTenantNationality(tenant.id) }}</div>
                    </td>

                    <!-- Colonne Pièce d'identité -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ getTenantIdInfo(tenant.id) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Affichage de <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> à 
        <span class="font-medium">
          {{ Math.min(currentPage * itemsPerPage, filteredTenants.length) }}
        </span> sur <span class="font-medium">{{ filteredTenants.length }}</span> résultats
      </div>
      
      <div class="flex space-x-2">
        <button
          @click="currentPage--"
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
          @click="currentPage++"
          :disabled="currentPage * itemsPerPage >= filteredTenants.length"
          :class="{
            'opacity-50 cursor-not-allowed': currentPage * itemsPerPage >= filteredTenants.length,
            'hover:bg-gray-100': currentPage * itemsPerPage < filteredTenants.length
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
import { useContractStore } from '@/stores/contractStore';
import { useAgentStore } from '@/stores/agentStore';
import { useAuthStore } from '@/stores/authStore';
import { format, parseISO, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
type ContractStatus = 'draft' | 'pending' | 'active' | 'terminated' | 'expired' | 'cancelled';

// Interfaces pour les propriétés
interface PropertyAddress {
  street?: string;
  city?: string;
  postal_code: string;
  country?: string;
  [key: string]: any;
}

interface PropertyType {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface Property {
  _id: string;
  title: string;
  type: string | PropertyType;
  address: PropertyAddress;
  surface: number;
  rooms: number;
  price: number;
  status: string;
  features: string[];
  images: string[];
  owner: string;
  agent?: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  __v?: number;
  id?: string;
}

// Interface pour les identités
interface Identity {
  documentType: 'permis de conduire' | 'passeport' | 'carte d\'électeur' | string;
  nationalId: string;
  documentFront?: File;
  documentBack?: File;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
}

// Interface pour les utilisateurs
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  nationality: string;
  identity: Identity;
  [key: string]: any;
}

// Interface pour les contrats
interface BaseContract {
  _id: string;
  propertyId: string | Property;
  tenantId: string | User;
  landlordId: string | User;
  agentId?: string | User | null;
  startDate: string | Date;
  endDate: string | Date | null;
  rent: number;
  deposit: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
  paymentDay: number;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'other';
  status: ContractStatus;
  terms?: string;
  documents?: string[];
  notes?: string;
  terminationDate?: string | Date | null;
  terminationReason?: string;
  terminationNotes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  __v?: number;
  agent?: User | null;
  property?: Property | null;
  tenant?: User | null;
  landlord?: User | null;
  [key: string]: any; // Pour les propriétés supplémentaires
}

interface Contract extends Omit<BaseContract, 'propertyId' | 'tenantId' | 'landlordId' | 'agentId'> {
  // Propriétés de base
  _id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  agentId?: string | null;
  startDate: string | Date;
  endDate: string | Date | null;
  rent: number;
  deposit: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
  paymentDay: number;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'other';
  status: ContractStatus;
  
  // Propriétés optionnelles
  terms?: string;
  documents?: string[];
  notes?: string;
  terminationDate?: string | Date | null;
  terminationReason?: string;
  terminationNotes?: string;
  
  // Métadonnées
  createdAt?: string | Date;
  updatedAt?: string | Date;
  __v?: number;
  
  // Relations chargées
  agent?: User | null;
  property?: Property | null;
  tenant?: User | null;
  landlord?: User | null;
  
  // Pour les propriétés supplémentaires
  [key: string]: any;
}

// Interface pour les locataires avec contrats
interface Tenant extends Omit<User, 'identity' | 'contracts'> {
  identity: Identity;
  contracts: Contract[];
  [key: string]: any; // Pour les propriétés supplémentaires
}

// Stores
const contractStore = useContractStore();
const authStore = useAuthStore();
const agentStore = useAgentStore();

// Références pour la modale de résiliation
const showTerminationModal = ref(false);
const terminationDate = ref('');
const terminationReason = ref('');
const selectedContractId = ref<string | null>(null);

// Formater une date pour l'input de type date
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Fermer la modale de résiliation
const closeTerminationModal = () => {
  showTerminationModal.value = false;
  selectedContractId.value = null;
  terminationReason.value = '';
  terminationDate.value = formatDateForInput(new Date());
};

// Confirmer la résiliation du contrat
const confirmTermination = async () => {
  if (!selectedContractId.value) return;
  
  try {
    await contractStore.updateContractStatus(selectedContractId.value, 'cancelled');
    closeTerminationModal();
    await loadTenants();
  } catch (error) {
    console.error('Erreur lors de la résiliation du contrat:', error);
  }
};

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

// Initialiser les états réactifs
const searchQuery = ref('');
const tenants = ref<Tenant[]>([]);
const currentPage = ref(1);
const tenantsWithContracts = ref<Array<{id: string, fullName: string, email: string}>>([]);
const itemsPerPage = 10;
const loading = ref(false);
const error = ref<string | null>(null);
const openActionsId = ref<string | null>(null);

// Réinitialiser la pagination lors de la recherche
watch(searchQuery, () => {
  currentPage.value = 1;
});

// Mettre à jour les noms des agents lorsque les contrats changent
const unwatchContracts = watch(() => contractStore.contracts, async (newContracts) => {
  if (!newContracts) return;
  
  console.log('Contrats mis à jour:', newContracts.length);
  
  // Pour chaque contrat, s'assurer que l'agent est chargé
  for (const contract of newContracts) {
    if (contract.agentId && typeof contract.agentId === 'string') {
      try {
        await agentStore.fetchAgentById(contract.agentId);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'agent:', error);
      }
    }
  }
}, { immediate: true });

// Fermer le menu des actions lors du clic en dehors
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (openActionsId.value && !target.closest(`[data-actions-menu="${openActionsId.value}"]`)) {
    openActionsId.value = null;
  }
};

// Charger les données au montage
onMounted(async () => {
  await loadTenants();
  document.addEventListener('click', handleClickOutside);
});

// Nettoyer les écouteurs d'événements lors du démontage du composant
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  unwatchContracts();
});

// Charger les données des locataires
const loadTenants = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Charger les contrats depuis le store une seule fois
    await contractStore.fetchContracts();
    
    // Vérifier si des contrats sont disponibles
    if (!contractStore.contracts || contractStore.contracts.length === 0) {
      console.log('Aucun contrat trouvé');
      tenants.value = [];
      return;
    }
    
    // Grouper les contrats par locataire
    const contractsByTenant: Record<string, Contract[]> = {};
    
    contractStore.contracts.forEach(contract => {
      if (!contract.tenantId) return;
      
      // Gérer le cas où tenantId est soit une chaîne, soit un objet avec _id
      const tenantId = typeof contract.tenantId === 'string' || typeof contract.tenantId === 'number' 
        ? String(contract.tenantId) 
        : String((contract.tenantId as any)?._id || '');
        
      if (!tenantId) return;
      
      if (!contractsByTenant[tenantId]) {
        contractsByTenant[tenantId] = [];
      }
      
      // Créer un objet property valide si nécessaire
      let validProperty: Property | null = null;
      if (contract.property) {
        const prop = contract.property as any;
        
        // Vérifier si c'est déjà un objet Property valide
        if (prop._id && prop.title && prop.address && prop.surface !== undefined) {
          validProperty = prop as Property;
        } else {
          // Créer un objet Property valide à partir des données brutes
          validProperty = {
            _id: String(prop._id || prop.id || ''),
            title: prop.title || 'Propriété sans nom',
            type: prop.type || 'appartement',
            address: typeof prop.address === 'string' 
              ? { street: prop.address, city: '', postal_code: '', country: '' }
              : {
                  street: prop.address?.street || '',
                  city: prop.address?.city || '',
                  postal_code: prop.address?.postal_code || '',
                  country: prop.address?.country || '',
                  ...(prop.address?.latitude !== undefined && { latitude: prop.address.latitude }),
                  ...(prop.address?.longitude !== undefined && { longitude: prop.address.longitude })
                },
            surface: Number(prop.surface) || 0,
            rooms: Number(prop.rooms) || 1,
            price: Number(prop.price) || 0,
            status: prop.status || 'available',
            features: Array.isArray(prop.features) ? prop.features : [],
            images: Array.isArray(prop.images) ? prop.images : [],
            owner: String(prop.owner || ''),
            agent: prop.agent,
            createdAt: prop.createdAt || new Date().toISOString(),
            updatedAt: prop.updatedAt || new Date().toISOString(),
            ...(prop.description && { description: prop.description }),
            ...(prop.__v !== undefined && { __v: Number(prop.__v) })
          };
        }
      }

      // Créer un objet de base du contrat avec les propriétés requises
      const baseContract = {
        ...contract,
        _id: String(contract._id || ''),
        propertyId: String(contract.propertyId || ''),
        paymentFrequency: (contract.paymentFrequency as 'monthly' | 'quarterly' | 'yearly') || 'monthly',
        paymentMethod: (contract.paymentMethod as 'bank_transfer' | 'check' | 'cash' | 'other') || 'bank_transfer',
        landlordId: String(contract.landlordId || ''),
        tenantId: String(contract.tenantId || ''),
        startDate: contract.startDate || new Date().toISOString(),
        rent: Number(contract.rent) || 0,
        deposit: Number(contract.deposit) || 0,
        paymentDay: Number(contract.paymentDay) || 1,
        status: (contract.status as ContractStatus) || 'draft',
      };

      // Créer le contrat final avec la propriété optionnelle
      const validContract: Contract = {
        ...baseContract,
        property: validProperty || null
      } as Contract;
      
      contractsByTenant[tenantId].push(validContract);
    });
    
    // Créer la liste des locataires avec leurs contrats
    const tenantList: Tenant[] = [];
    
    for (const [tenantId, contracts] of Object.entries(contractsByTenant)) {
      if (!contracts || contracts.length === 0) continue;
      
      // Trier les contrats par date de début (du plus récent au plus ancien)
      const sortedContracts = [...contracts].sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateB - dateA;
      });
      
      // Utiliser les informations du premier contrat pour le locataire
      const firstContract = sortedContracts[0];
      const tenantData = firstContract.tenant || { _id: tenantId } as unknown as User;
      
      // Créer un objet locataire avec les données du premier contrat
      const tenant: Tenant = {
        ...tenantData,
        _id: tenantData._id || tenantId,
        contracts: sortedContracts as unknown as Contract[]
      };
      
      tenantList.push(tenant);
    }
    
    // Trier les locataires par nom
    tenantList.sort((a, b) => {
      const nameA = getTenantFullName(a).toLowerCase();
      const nameB = getTenantFullName(b).toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    // Mettre à jour les états réactifs
    tenants.value = tenantList;
    
    // Mettre à jour la liste des locataires avec contrats pour la compatibilité
    tenantsWithContracts.value = tenantList.map(tenant => ({
      id: tenant._id,
      fullName: getTenantFullName(tenant),
      email: tenant.email || ''
    }));
    
    console.log('Données des locataires chargées avec succès:', tenantList.length, 'locataires trouvés');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur lors du chargement des locataires:', errorMessage, err);
    error.value = 'Impossible de charger la liste des locataires. Veuillez réessayer plus tard.';
  } finally {
    loading.value = false;
  }
};

// Cette fonction n'est plus nécessaire car la logique a été intégrée dans loadTenants
// pour éviter les appels API redondants

// Filtrer les locataires en fonction de la recherche
const filteredTenants = computed(() => {
  if (!searchQuery.value.trim()) return tenants.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return tenants.value.filter(tenant => {
    const fullName = getTenantFullName(tenant).toLowerCase();
    const email = (tenant.email || '').toLowerCase();
    const phone = (tenant.phone || '').toLowerCase();
    
    return (
      fullName.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      (tenant.contracts?.some(c => c.propertyId && typeof c.propertyId !== 'string' && 
        (c.propertyId as Property).title?.toLowerCase().includes(query)))
    );
  });
});

// Pagination
const paginatedTenants = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTenants.value.slice(start, end);
});

// Méthodes utilitaires
const getTenantFullName = (tenant: Tenant | { fullName?: string; firstName?: string; lastName?: string; name?: string } | null | undefined): string => {
  if (!tenant) return 'Inconnu';
  
  // Vérifier si c'est un objet
  if (typeof tenant !== 'object') return 'Locataire inconnu';
  
  // Essayer de récupérer le nom complet dans l'ordre de priorité
  if ('fullName' in tenant && typeof tenant.fullName === 'string' && tenant.fullName.trim()) {
    return tenant.fullName.trim();
  }
  
  // Essayer de construire le nom à partir de firstName et lastName
  const firstName = 'firstName' in tenant ? String(tenant.firstName || '') : '';
  const lastName = 'lastName' in tenant ? String(tenant.lastName || '') : '';
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;
  
  // Essayer de récupérer le nom directement
  if ('name' in tenant && typeof tenant.name === 'string' && tenant.name.trim()) {
    return tenant.name.trim();
  }
  
  return 'Locataire inconnu';
};

const getTenantEmail = (tenant: Tenant | { email?: string } | null | undefined): string => {
  return tenant?.email || '';
};

const getTenantPhone = (tenantId: string): string => {
  const tenant = tenants.value.find(t => t._id === tenantId);
  return tenant?.phone || 'Non renseigné';
};

const getTenantNationality = (tenantId: string): string => {
  const tenant = tenants.value.find(t => t._id === tenantId);
  return tenant?.nationality || 'Non renseignée';
};

const getTenantIdInfo = (tenantId: string): string => {
  const tenant = tenants.value.find(t => t._id === tenantId);
  if (!tenant?.identity) return 'Non renseignée';
  return `${tenant.identity.documentType || 'CNI'} : ${tenant.identity.nationalId || 'Non renseigné'}`;
};

// Obtenir la date du dernier contrat d'un locataire
const getLatestContractDate = (tenant: Tenant): string => {
  if (!tenant.contracts || !Array.isArray(tenant.contracts) || tenant.contracts.length === 0) {
    return 'Aucun contrat';
  }
  
  try {
    // Filtrer les contrats valides avec une date de début
    const validContracts = tenant.contracts.filter(contract => {
      if (!contract || !contract.startDate) return false;
      const date = new Date(contract.startDate);
      return !isNaN(date.getTime());
    });
    
    if (validContracts.length === 0) return 'Aucune date valide';
    
    // Trier par date de début (du plus récent au plus ancien)
    validContracts.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });
    
    const latestContract = validContracts[0];
    const startDate = new Date(latestContract.startDate);
    
    return format(startDate, 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.error('Erreur lors de la récupération de la date du dernier contrat:', error);
    return 'Date inconnue';
  }
};

const hasActiveContract = (tenant: Tenant): boolean => {
  if (!tenant.contracts || !Array.isArray(tenant.contracts) || tenant.contracts.length === 0) {
    return false;
  }
  
  const now = new Date();
  
  return tenant.contracts.some(contract => {
    try {
      // Vérifier que le contrat et les dates sont valides
      if (!contract || !contract.startDate || !contract.endDate) {
        return false;
      }
      
      // Convertir en Date si nécessaire
      const startDate = new Date(contract.startDate);
      const endDate = new Date(contract.endDate);
      
      // Vérifier que les dates sont valides
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('Date de contrat invalide pour le locataire:', tenant._id, contract);
        return false;
      }
      
      // Vérifier si la date actuelle est dans l'intervalle du contrat
      return startDate <= now && endDate >= now;
    } catch (error) {
      console.error('Erreur lors de la vérification du contrat actif:', error);
      return false;
    }
  });
};

// Obtenir le statut du locataire
const getTenantStatus = (tenant: Tenant): string => {
  if (hasActiveContract(tenant)) return 'Actif';
  if (tenant.contracts?.some(c => c.status === 'pending')) return 'En attente';
  if (tenant.contracts?.some(c => c.status === 'terminated' || c.status === 'expired')) return 'Ancien locataire';
  return 'Statut inconnu';
};

// Obtenir la classe CSS pour le statut du locataire
const getTenantStatusClass = (tenant: Tenant): string => {
  if (hasActiveContract(tenant)) return 'bg-green-100 text-green-800';
  if (tenant.contracts?.some(c => c.status === 'pending')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

// Formater une date
const formatDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return 'Non spécifié';
  
  try {
    let date: Date;
    
    // Gérer différents types d'entrée
    if (typeof dateInput === 'string') {
      // Essayer de parser la date si c'est une chaîne
      date = parseISO(dateInput);
    } else if (dateInput instanceof Date) {
      // Utiliser directement si c'est déjà un objet Date
      date = dateInput;
    } else {
      // Tenter de convertir en Date si c'est un autre type
      date = new Date(dateInput);
    }
    
    // Vérifier que la date est valide
    if (isNaN(date.getTime())) {
      console.warn('Date invalide reçue:', dateInput);
      return 'Date invalide';
    }
    
    // Formater la date
    return format(date, 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error, 'Date reçue:', dateInput);
    return 'Date invalide';
  }
};

// Formater une adresse (fonction utilitaire)
const formatAddress = (address: PropertyAddress | undefined | null): string => {
  if (!address) return 'Adresse non spécifiée';
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.postal_code) parts.push(address.postal_code);
  if (address.city) parts.push(address.city);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};

// Formater une valeur monétaire
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};
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
