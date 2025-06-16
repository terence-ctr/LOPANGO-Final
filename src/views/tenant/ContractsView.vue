<template>
  <div class="bg-white min-h-screen p-6">
    <!-- Tableau des contrats -->
    <ContractsTable 
      v-if="!showAddContractForm"
      :contracts="contracts"
      @contract-click="handleContractClick"
      @add-contract="handleAddContract"
      @notifications-click="handleNotificationsClick"
    />

    <!-- Formulaire d'ajout de contrat -->
    <ContractForm 
      v-else
      @submitted="handleContractSubmitted"
      @cancel="showAddContractForm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ContractsTable from '@/components/tenant/contracts/ContractsTable.vue';
import ContractForm from '@/components/tenant/contracts/ContractForm.vue';

type ContractStatus = 'active' | 'pending' | 'ended' | 'cancelled';

interface Contract {
  id: string | number;
  name: string;
  address: string;
  tenant: string;
  startDate: string | Date;
  endDate: string | Date | null;
  status: ContractStatus;
}

const router = useRouter();
const showAddContractForm = ref(false);
const contracts = ref<Contract[]>([]);

// Charger les contrats
const loadContracts = async () => {
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Données de test (à remplacer par un appel API réel)
    contracts.value = [
      {
        id: 1,
        name: 'Appartement B20',
        address: 'Luapula A16, C/Barumbu, Immeuble Dan',
        tenant: 'Elie Oko',
        startDate: '2023-05-01',
        endDate: null,
        status: 'pending' as const
      },
      {
        id: 2,
        name: 'Appartement B21',
        address: 'Luapula A16, C/Kin, Immeuble Boketshu',
        tenant: 'Meschack Kapanga',
        startDate: '2023-02-01',
        endDate: '2023-05-01',
        status: 'active' as const
      },
      {
        id: 3,
        name: 'Appartement B22',
        address: 'Luapula A16, C/Lemba, Immeuble Dan',
        tenant: 'Marcel Senga',
        startDate: '2022-02-01',
        endDate: '2022-05-01',
        status: 'ended' as const
      }
    ];
  } catch (error) {
    console.error('Erreur lors du chargement des contrats:', error);
  }
};

// Gestion des événements
const handleContractClick = (contract: Contract) => {
  router.push(`/contrats/${contract.id}`);
};

const handleAddContract = () => {
  showAddContractForm.value = true;
};

const handleContractSubmitted = (newContract: Contract) => {
  contracts.value.unshift(newContract);
  showAddContractForm.value = false;
  // Recharger les contrats pour s'assurer d'avoir les données à jour
  loadContracts();
};

const handleNotificationsClick = () => {
  // Logique pour gérer le clic sur les notifications
  console.log('Notifications cliquées');
  // Rediriger vers la page des notifications
  // router.push('/notifications');
};

// Charger les données au montage du composant
onMounted(() => {
  loadContracts();
});
</script>
