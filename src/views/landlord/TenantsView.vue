<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Liste des locataires</h1>
    
    <!-- Tableau des locataires -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- En-tête avec recherche -->
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <div class="flex-1 max-w-md">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Rechercher un locataire..." 
            class="w-full px-3 py-2 border rounded-md text-sm"
          >
        </div>
        <button 
          @click="loadTenants"
          class="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 flex items-center"
          :disabled="loading"
        >
          <i class="fas fa-sync mr-2" :class="{'fa-spin': loading}"></i>
          Actualiser
        </button>
      </div>

      <!-- Message de chargement -->
      <div v-if="loading" class="p-8 text-center">
        <i class="fas fa-circle-notch fa-spin text-blue-500 text-2xl"></i>
        <p class="mt-2 text-gray-600">Chargement des locataires...</p>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="p-4 text-red-500">
        {{ error }}
      </div>

      <!-- Tableau -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom & Prénom
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contrats
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernier contrat
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="tenant in filteredTenants" :key="tenant.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <i class="fas fa-user text-blue-500"></i>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ tenant.firstName }} {{ tenant.lastName }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ tenant.email || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ tenant.phone || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                      :class="tenant.contracts.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                  {{ tenant.contracts.length }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getLatestContractDate(tenant) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Aucun résultat -->
      <div v-if="!loading && filteredTenants.length === 0" class="p-8 text-center">
        <p class="text-gray-500">Aucun locataire trouvé.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useContractStore } from '@/stores/contractStore';
import { useAuthStore } from '@/stores/auth';
import type { Contract } from '@/types/contract';
import api from '@/services/api';

const contractStore = useContractStore();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');

interface TenantWithContracts {
  id: string | number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  contracts: Contract[];
}

const tenants = ref<TenantWithContracts[]>([]);

const filteredTenants = computed(() => {
  if (!searchQuery.value.trim()) return tenants.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return tenants.value.filter(tenant => {
    const fullName = `${tenant.firstName || ''} ${tenant.lastName || ''}`.toLowerCase();
    const email = tenant.email?.toLowerCase() || '';
    const phone = tenant.phone?.toLowerCase() || '';
    
    return fullName.includes(query) || 
           email.includes(query) || 
           phone.includes(query);
  });
});

const loadTenants = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    if (!authStore.isAuthenticated) {
      throw new Error('Vous devez être connecté pour voir les locataires');
    }
    
    console.log('Chargement des contrats...');
    await contractStore.fetchContracts();
    
    console.log('Contrats chargés:', contractStore.contracts);
    const tenantMap = new Map<string | number, TenantWithContracts>();
    
    // Parcourir les contrats et extraire les informations des locataires
    contractStore.contracts.forEach(contract => {
      if (contract.tenant) {
        const tenantId = contract.tenant.id;
        const existingTenant = tenantMap.get(tenantId);
        
        console.log(`\nTraitement du contrat #${contract.id} pour le locataire ${tenantId}:`, {
          contractData: contract,
          tenantData: contract.tenant
        });
        
        if (existingTenant) {
          existingTenant.contracts.push(contract);
        } else {
          // Utiliser les données du contrat.tenant comme source principale
          const tenant = contract.tenant;
          tenantMap.set(tenantId, {
            id: tenantId,
            firstName: tenant.firstName || 'Prénom inconnu',
            lastName: tenant.lastName || 'Nom inconnu',
            email: tenant.email || '',
            phone: tenant.telephone || '',
            contracts: [contract]
          });
        }
      }
    });
    
    const sortedTenants = Array.from(tenantMap.values()).sort((a, b) => 
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
    );
    
    console.log('\nLocataires traités avec données complètes:', sortedTenants);
    tenants.value = sortedTenants;
    
  } catch (err) {
    console.error('Erreur lors du chargement des locataires:', err);
    error.value = 'Impossible de charger la liste des locataires.';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getLatestContractDate = (tenant: TenantWithContracts) => {
  if (!tenant.contracts || tenant.contracts.length === 0) return '-';
  
  const sorted = [...tenant.contracts].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  
  return formatDate(sorted[0].startDate);
};

// Charger les locataires au montage du composant
onMounted(() => {
  loadTenants();
});
</script>
