import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { Contract, ContractFormData } from '@/types/contract';

export const useContractStore = defineStore('contract', () => {
  const contracts = ref<Contract[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchContracts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/contracts');
      contracts.value = response.data;
    } catch (err) {
      error.value = 'Erreur lors de la récupération des contrats.';
      console.error(err);
    }
    loading.value = false;
  };

  const createContract = async (contractData: ContractFormData) => {
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
