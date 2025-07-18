<template>
  <div class="p-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Mes propriétés gérées</h1>
      <div class="flex space-x-3">
        <button @click="refreshProperties" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
       
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select v-model="filters.status" class="w-full border rounded-md px-3 py-2 text-sm">
            <option value="">Tous les statuts</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="LOUE">Loué</option>
            <option value="MAINTENANCE">En maintenance</option>
            <option value="INACTIF">Inactif</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select v-model="filters.type" class="w-full border rounded-md px-3 py-2 text-sm">
            <option value="">Tous les types</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="MAISON">Maison</option>
            <option value="LOCAL">Local commercial</option>
            <option value="TERRAIN">Terrain</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <input 
            v-model="filters.search" 
            type="text" 
            class="w-full border rounded-md px-3 py-2 text-sm" 
            placeholder="Rechercher une propriété..."
          />
        </div>
        <div class="flex justify-end">
          <button @click="applyFilters" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Appliquer les filtres
          </button>
         
        </div>
      </div>
    </div>

    <!-- Tableau des propriétés -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des propriétés...</p>
      </div>
      <div v-else-if="!filteredProperties.length" class="p-8 text-center">
        <p class="text-gray-500">Aucune propriété ne correspond à vos critères de recherche.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50">
            <tr class="text-xs">
              <th scope="col" class="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-32">
                Titre
              </th>
              <th scope="col" class="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-36">
                Bailleur
              </th>
              <th scope="col" class="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-36">
                Locataire
              </th>
              <th scope="col" class="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-48">
                Adresse
              </th>
              <th scope="col" class="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-20">
                Statut
              </th>
              <th scope="col" class="px-2 py-2 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="property in paginatedProperties" :key="property.id">
              <td class="px-2 py-1 whitespace-nowrap text-xs">
                <div>
                  <div class="font-medium text-gray-900">{{ property.title || 'Sans titre' }}</div>
                   </div>
              </td>
              <td class="px-2 py-1 whitespace-nowrap text-xs">
                <div v-if="property.landlord" class="text-sm">
                  <div class="font-medium text-gray-900 truncate text-xs">
                    {{ [property.landlord.firstName, property.landlord.lastName].filter(Boolean).join(' ') || 'Propriétaire' }}
                  </div>
                 
                </div>
                <div v-else class="text-sm text-gray-400 italic">
                  Non spécifié
                </div>
              </td>
              <td class="px-1 py-1 whitespace-nowrap text-xs">
                <div v-if="property.tenant" class="text-sm">
                  <div class="font-medium text-gray-900">
                    {{ [property.tenant.firstName, property.tenant.lastName].filter(Boolean).join(' ') || 'Locataire' }}
                  </div>
                </div>
                <div v-else class="text-sm text-gray-400 italic">
                  Aucun locataire
                </div>
              </td>
              <td class="px-1 py-1 whitespace-nowrap text-xs">
                <div class="text-xs text-gray-900">
                  <div class="font-medium">{{ property.street || 'Adresse non spécifiée' }}</div>
                </div>
              </td>
            
              <td class="px-2 py-1 whitespace-nowrap text-xs">
                <span :class="['px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full', getStatusBadgeClass(property.status)]">
                  {{ formatStatus(property.status) }}
                </span>
              </td>
              <td class="px-2 py-1 whitespace-nowrap text-right text-xs font-medium">
                <div class="relative inline-block text-left" v-click-away="() => activeDropdown === property.id ? activeDropdown = null : null">
                  <button @click="toggleDropdown(property.id)" class="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded hover:bg-gray-100">
                    <i class="fas fa-ellipsis-h text-sm"></i>
                  </button>
                  <div v-if="activeDropdown === property.id" class="origin-top-right absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div class="py-1" role="menu" aria-orientation="vertical">
                      <router-link 
                        :to="{ name: 'agent-property-detail', params: { id: property.id } }"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        <i class="fas fa-eye mr-2 text-gray-400 w-4 text-center"></i> Voir les détails
                      </router-link>
                      <button @click="reportProperty(property.id)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem">
                        <i class="fas fa-flag mr-2 text-gray-400 w-4 text-center"></i> Signaler un problème
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
    <div class="mt-8 flex justify-center">
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          <span class="sr-only">Précédent</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
        <a href="#" aria-current="page" class="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
          1
        </a>
        <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
          2
        </a>
        <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
          3
        </a>
        <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
          ...
        </span>
        <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
          8
        </a>
        <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          <span class="sr-only">Suivant</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useContractStore } from '@/stores/contractStore';
import { useAuthStore } from '@/stores/auth';
import { directive as vClickAway } from 'vue3-click-away';
import { api } from '@/config/axios';
import { apiConfig } from '@/config/api.config';

// Types constants
const PROPERTY_TYPES = {
  APPARTEMENT: 'Appartement',
  MAISON: 'Maison',
  LOCAL: 'Local commercial',
  TERRAIN: 'Terrain',
  BUREAU: 'Bureau',
  AUTRE: 'Autre'
} as const;

type PropertyType = keyof typeof PROPERTY_TYPES;

const STATUS_TYPES = {
  DISPONIBLE: 'Disponible',
  LOUE: 'Loué',
  MAINTENANCE: 'En maintenance',
  INACTIF: 'Inactif'
} as const;

type StatusType = keyof typeof STATUS_TYPES;

// Interface pour un locataire
interface Tenant {
  id?: string | number;
  _id?: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
}

// Interface pour un propriétaire
interface Landlord {
  id?: string | number;
  _id?: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Interface pour une propriété
interface Property {
  id: string | number;
  _id?: string | number;
  title: string;
  type: keyof typeof PROPERTY_TYPES;
  status: keyof typeof STATUS_TYPES;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  surface: number;
  rooms: number;
  rent: number;
  description?: string;
  images?: string[];
  created_at?: string;
  updated_at?: string;
  contractId?: string | number;
  tenant?: Tenant;
  landlord?: Landlord;
  rentFrequency?: 'monthly' | 'yearly';
}

const router = useRouter();
const authStore = useAuthStore();


// Hooks
onMounted(() => {
  refreshProperties();
});
;

// État
const properties = ref<Property[]>([]);
const isLoading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 10;
const activeDropdown = ref<string | number | null>(null);

// Filtres
const filters = ref({
  status: '',
  type: '',
  search: ''
});

// Computed properties
const filteredProperties = computed(() => {
  let result = [...properties.value];
  
  // Filtrer par statut
  if (filters.value.status) {
    result = result.filter((prop: Property) => prop.status === filters.value.status);
  }
  
  // Filtrer par type
  if (filters.value.type) {
    result = result.filter((prop: Property) => prop.type === filters.value.type);
  }
  
  // Recherche
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase();
    result = result.filter((prop: Property) => 
      prop.title?.toLowerCase().includes(searchLower)
    );
  }
  
  return result;
});

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProperties.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredProperties.value.length / itemsPerPage);
});

// Méthodes de formatage
const formatPropertyType = (type: string) => {
  const types: Record<string, string> = {
    'APPARTEMENT': 'Appartement',
    'MAISON': 'Maison',
    'LOCAL': 'Local commercial',
    'TERRAIN': 'Terrain',
    'BUREAU': 'Bureau',
    'AUTRE': 'Autre'
  };
  return types[type as keyof typeof types] || type || 'Non spécifié';
};

// Formater l'adresse complète
const formatAddress = (property: Property) => {
  const parts = [
    property.street,
    property.postal_code,
    property.city,
    property.country
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : 'Adresse non disponible';
};

const formatCurrency = (amount: number, currencyCode: string = 'EUR') => {
  try {
    // Nettoyer le code de devise (enlever les espaces et convertir en majuscules)
    const cleanCurrency = (currencyCode || 'EUR')
      .toString()
      .trim()
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
    
    // Vérifier si la devise est valide (au moins 3 lettres)
    const currency = cleanCurrency.length >= 3 ? cleanCurrency.substring(0, 3) : 'EUR';
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  } catch (error) {
    console.error('Erreur de formatage de la devise:', error);
    return `${amount || 0} ${currencyCode || 'EUR'}`;
  }
};

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    'DISPONIBLE': 'Disponible',
    'LOUE': 'Loué',
    'MAINTENANCE': 'En maintenance',
    'INACTIF': 'Inactif'
  };
  return statuses[status as keyof typeof statuses] || status || 'Inconnu';
};

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'DISPONIBLE': 'bg-green-100 text-green-800',
    'LOUE': 'bg-blue-100 text-blue-800',
    'MAINTENANCE': 'bg-yellow-100 text-yellow-800',
    'INACTIF': 'bg-gray-100 text-gray-800'
  };
  return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'}`;
};

// Méthodes de gestion
const toggleDropdown = (propertyId: string | number) => {
  activeDropdown.value = activeDropdown.value === propertyId ? null : propertyId;
};

const viewPropertyDetails = async (propertyId: string | number) => {
  // Navigation vers la page de détails
  await router.push(`/agent/property/${propertyId}`);
};

const reportProperty = async (propertyId: string | number) => {
  // Logique de signalement
  console.log('Signalement de la propriété:', propertyId);
  // Ici, vous pouvez ajouter la logique d'API pour envoyer le signalement
};

const contractStore = useContractStore();

const refreshProperties = async () => {
  try {
    isLoading.value = true;
    
    // Vérifier si l'utilisateur est authentifié
    if (!authStore.isAuthenticated) {
      console.log('Utilisateur non authentifié, redirection vers la page de connexion');
      await router.push('/login');
      return;
    }
    
    // Vérifier que l'utilisateur est bien un agent
    if (authStore.userType !== 'agent') {
      console.error('Accès non autorisé : utilisateur non agent');
      await router.push('/unauthorized');
      return;
    }
    
    // Récupérer l'ID utilisateur en toute sécurité
    const userId = (authStore.user as any)?.id || (authStore.user as any)?._id;
    if (!userId) {
      console.error('ID utilisateur manquant dans le store');
      console.log('Objet utilisateur actuel:', authStore.user);
      return;
    }
    
    // Récupérer d'abord les contrats de l'agent
    await contractStore.fetchContracts();
    
    // Extraire les propriétés uniques des contrats
    const propertiesFromContracts = contractStore.contracts
      .filter((contract: any) => contract?.property)
      .map((contract: any) => {
        const prop = contract.property || {};
        const address = prop.address || {};
        
        // Extraire les valeurs de surface et loyer, en priorisant celles du contrat puis de la propriété
        // La surface peut être dans contract.area ou prop.area ou prop.surface
        const surfaceValue = !isNaN(contract.area) ? Number(contract.area) : 
                           (!isNaN(prop.area) ? Number(prop.area) : 
                           (!isNaN(prop.surface) ? Number(prop.surface) : 0));
        
        // Le loyer doit être dans contract.rent
        const rentValue = !isNaN(contract.rent) ? Number(contract.rent) : 
                         (!isNaN(prop.rent) ? Number(prop.rent) : 0);
        
        return {
          ...prop,
          id: prop.id || prop._id || '', // Gérer à la fois id et _id
          status: contract.status === 'active' ? 'LOUE' : 'DISPONIBLE',
          contractId: contract.id || contract._id || '',
          tenant: contract.tenant || {},
          rentFrequency: contract.paymentFrequency || contract.rentFrequency || 'monthly',
          // Assurer que tous les champs requis sont présents avec des valeurs par défaut
          street: prop.street || address?.street || '',
          city: prop.city || address?.city || '',
          postal_code: prop.postal_code || prop.postalCode || address?.postal_code || '',
          country: prop.country || address?.country || '',
          // Informations du bailleur avec valeurs par défaut
          landlord: {
            id: (contract.landlord?.id || contract.landlord?._id || prop.landlord?.id || prop.landlord?._id || '').toString(),
            firstName: contract.landlord?.firstName || prop.landlord?.firstName || 'Propriétaire',
            lastName: contract.landlord?.lastName || prop.landlord?.lastName || 'Inconnu',
            email: contract.landlord?.email || prop.landlord?.email || ''
          },
          // Utiliser area pour la surface qui est le champ standard dans l'interface Property
          area: surfaceValue,
          // Garder surface pour la rétrocompatibilité
          surface: surfaceValue,
          rooms: Number(prop.rooms) || 0,
          rent: rentValue,
          // S'assurer que la devise est définie
          currency: contract.currency || prop.currency || 'EUR',
          // Ajout de champs optionnels avec des valeurs par défaut
          description: prop.description || '',
          images: Array.isArray(prop.images) ? prop.images : [],
          created_at: prop.created_at || new Date().toISOString(),
          updated_at: prop.updated_at || new Date().toISOString()
        } as Property; // Type assertion pour correspondre à l'interface Property
      });
    
    // Éviter les doublons de propriétés
    const uniqueProperties = Array.from(new Map(
      propertiesFromContracts.map(prop => [prop.id, prop])
    ).values()) as unknown as Property[];
    
    console.log('Propriétés chargées:', JSON.parse(JSON.stringify(uniqueProperties)));
    properties.value = uniqueProperties;
  } catch (error) {
    console.error('Erreur lors du chargement des propriétés:', error);
    properties.value = [];
  } finally {
    isLoading.value = false;
  }
};

const showAddPropertyModal = () => {
  // Ouvrir le modal d'ajout de propriété
  console.log('Ouvrir le modal d\'ajout de propriété');
  // Ici, vous pouvez ajouter la logique pour ouvrir le modal
};

const applyFilters = () => {
  currentPage.value = 1;
};

const resetFilters = () => {
  filters.value = {
    status: '',
    type: '',
    search: ''
  };
  currentPage.value = 1;
};

// Hooks
onMounted(() => {
  refreshProperties();
});
</script>
