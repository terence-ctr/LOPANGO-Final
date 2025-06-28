<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <!-- En-tête de la page -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Gestion des Contrats</h1>
      <router-link :to="{ name: 'landlord-contract-create' }" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        Ajouter un contrat
      </router-link>
    </div>

        

    <!-- Tableau des contrats -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propriété</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locataire</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates (Début - Fin)</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Les lignes de contrat seront ajoutées ici -->
                    <tr v-if="loading">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">Chargement...</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="5" class="px-6 py-4 text-center text-red-500">{{ error }}</td>
          </tr>
          <tr v-else-if="contracts.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
              Aucun contrat trouvé.
            </td>
          </tr>
          <tr v-for="contract in contracts" :key="contract.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ contract.property?.title }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ contract.tenant?.firstName }} {{ contract.tenant?.lastName }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ contract.startDate }} - {{ contract.endDate }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getContractStatusClass(contract.status)}-100 text-${getContractStatusClass(contract.status)}-800`">
                {{ contract.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button class="text-indigo-600 hover:text-indigo-900">Détails</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useContractStore } from '@/stores/contractStore';

const contractStore = useContractStore();
const { contracts, loading, error } = storeToRefs(contractStore);

onMounted(() => {
  contractStore.fetchContracts();
});

function getContractStatusClass(status: string) {
  const statusClasses: Record<string, string> = {
    active: 'green',
    pending: 'yellow',
    ended: 'gray',
    cancelled: 'red',
    draft: 'blue',
  };
  return statusClasses[status] || 'gray';
}
</script>



<style scoped>
/* Vous pouvez ajouter des styles spécifiques ici si nécessaire */
</style>
