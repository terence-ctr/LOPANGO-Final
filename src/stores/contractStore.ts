import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { Contract } from '@/types/contract';
import type { ApiContractData } from '@/utils/contractMapper';

export const useContractStore = defineStore('contract', () => {
  const contracts = ref<Contract[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchContracts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/contracts');
      console.log('Données des contrats reçues de l\'API:', response.data);
      
      // Log détaillé pour chaque contrat
      response.data.forEach((contract: any, index: number) => {
        console.log(`Contrat #${index + 1}:`, {
          id: contract.id,
          tenant: contract.tenant ? {
            id: contract.tenant.id,
            firstName: contract.tenant.firstName,
            lastName: contract.tenant.lastName
          } : 'Aucun locataire',
          property: contract.property ? {
            id: contract.property.id,
            title: contract.property.title
          } : 'Aucune propriété'
        });
      });
      
      contracts.value = response.data;
    } catch (err) {
      error.value = 'Erreur lors de la récupération des contrats.';
      console.error(err);
    }
    loading.value = false;
  };

  const createContract = async (contractData: ApiContractData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/contracts', contractData);
      contracts.value.push(response.data);
    } catch (err) {
      error.value = 'Erreur lors de la création du contrat.';
      console.error(err);
      throw err; // Re-throw to be caught in the component
    }
    loading.value = false;
  };

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    createContract,
  };
});
