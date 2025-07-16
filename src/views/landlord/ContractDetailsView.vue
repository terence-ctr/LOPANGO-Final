<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Détails du contrat</h1>
        <p class="mt-1 text-sm text-gray-500">Informations détaillées sur le contrat</p>
      </div>
      <div>
        <router-link 
          to="/landlord/contracts" 
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          Retour à la liste
        </router-link>
      </div>
    </div>

    <!-- Carte de détail du contrat -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-500">Chargement des détails du contrat...</p>
    </div>

    <div v-else-if="contract" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Contrat #{{ contract._id || contract.id }}
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          Statut: 
          <span :class="{
            'bg-green-100 text-green-800': contract.status === 'active',
            'bg-red-100 text-red-800': contract.status === 'terminated',
            'bg-yellow-100 text-yellow-800': contract.status === 'pending',
            'px-2 py-1 rounded-full text-xs font-medium'
          }">
            {{ getStatusLabel(contract.status) }}
          </span>
        </p>
      </div>
      
      <div class="border-t border-gray-200">
        <dl>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Locataire</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ formatTenantName(contract.tenant) }}
            </dd>
          </div>
          
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Bien concerné</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ contract.property?.title || 'Non spécifié' }}
              <p v-if="contract.property?.address" class="text-gray-500 text-sm mt-1">
                {{ formatAddress(contract.property.address) }}
              </p>
            </dd>
          </div>
          
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Période</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              Du {{ formatDate(contract.startDate) }} 
              <span v-if="contract.endDate">
                au {{ formatDate(contract.endDate) }}
              </span>
              <span v-else>
                (Contrat à durée indéterminée)
              </span>
            </dd>
          </div>
          
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Loyer mensuel</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ formatCurrency(contract.rent) }} {{ contract.currency || 'EUR' }}
            </dd>
          </div>
          
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Dépôt de garantie</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ formatCurrency(contract.deposit) }} {{ contract.currency || 'EUR' }}
              <span class="text-gray-500 ml-2">({{ contract.deposit_status || 'Non payé' }})</span>
            </dd>
          </div>
          
          <div v-if="contract.special_conditions" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Conditions particulières</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
              {{ contract.special_conditions }}
            </dd>
          </div>
        </dl>
      </div>
      
      <div class="px-4 py-4 bg-gray-50 text-right sm:px-6">
        <button
          @click="editContract"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
        >
          <i class="fas fa-edit mr-2"></i>
          Modifier
        </button>
        <button
          v-if="contract.status === 'active'"
          @click="confirmTermination"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <i class="fas fa-times-circle mr-2"></i>
          Résilier le contrat
        </button>
      </div>
    </div>
    
    <div v-else class="text-center py-12">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <i class="fas fa-exclamation-triangle text-red-600"></i>
      </div>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Contrat non trouvé</h3>
      <p class="mt-1 text-sm text-gray-500">Le contrat demandé n'existe pas ou vous n'avez pas les droits pour le consulter.</p>
      <div class="mt-6">
        <router-link 
          to="/landlord/contracts" 
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          Retour à la liste des contrats
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLandlordStore } from '@/stores/landlordStore';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const landlordStore = useLandlordStore();
const { contracts } = storeToRefs(landlordStore);

const loading = ref(true);
const contract = ref<any>(null);

// Fonctions utilitaires
const formatDate = (dateString: string | number | Date | null | undefined): string => {
  if (!dateString) return 'Non spécifié';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatAddress = (address: any): string => {
  if (!address) return 'Adresse non spécifiée';
  if (typeof address === 'string') return address;
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.postal_code || address.city) {
    parts.push(`${address.postal_code || ''} ${address.city || ''}`.trim());
  }
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};

const formatTenantName = (tenant: { firstName?: string; lastName?: string } | string | null | undefined): string => {
  if (!tenant) return 'Locataire inconnu';
  if (typeof tenant === 'string') return tenant;
  
  const nameParts = [];
  if (tenant.firstName) nameParts.push(tenant.firstName);
  if (tenant.lastName) nameParts.push(tenant.lastName);
  
  return nameParts.length > 0 ? nameParts.join(' ') : 'Locataire inconnu';
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Actif',
    'terminated': 'Résilié',
    'pending': 'En attente',
    'expired': 'Expiré',
    'draft': 'Brouillon'
  };
  return statusMap[status] || status;
};

// Actions
const editContract = () => {
  if (contract.value?._id) {
    router.push(`/landlord/contracts/${contract.value._id}/edit`);
  }
};

const confirmTermination = () => {
  if (confirm('Êtes-vous sûr de vouloir résilier ce contrat ? Cette action est irréversible.')) {
    // Implémentez ici la logique de résiliation du contrat
    alert('Fonctionnalité de résiliation à implémenter');
  }
};

// Chargement des données
onMounted(async () => {
  const contractId = route.params.id as string;
  
  try {
    // Vérifier d'abord si le contrat est déjà dans le store
    const existingContract = contracts?.value?.find((c: Contract) => c._id === contractId || c.id === contractId);
    
    if (existingContract) {
      contract.value = existingContract;
    } else {
      // Si le contrat n'est pas dans le store, essayez de le charger
      await landlordStore.fetchContracts();
      const loadedContract = contracts?.value?.find((c: Contract) => c._id === contractId || c.id === contractId);
      
      if (loadedContract) {
        contract.value = loadedContract;
      } else {
        console.error('Contrat non trouvé');
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du contrat:', error);
  } finally {
    loading.value = false;
  }
});
</script>
