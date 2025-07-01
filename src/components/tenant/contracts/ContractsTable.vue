<template>
  <div class="max-w-[1040px] mx-auto px-4 py-8">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="font-extrabold text-lg leading-6">
        Mes contrats
      </h1>
      <div class="flex items-center space-x-4">
        <button 
          aria-label="Notifications" 
          class="text-gray-600 hover:text-gray-900 text-base"
          @click="$emit('notifications-click')"
        >
          <i class="far fa-bell"></i>
        </button>
      </div>
    </div>

    <!-- Barre d'outils -->
    <div class="flex flex-wrap gap-3 mb-6">
      <button class="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100" type="button">
        <i class="fas fa-sliders-h text-xs"></i>
        Filtrer
        <i class="fas fa-chevron-down text-xs ml-1"></i>
      </button>
      
      <select 
        v-model="selectedColumns"
        class="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
      >
        <option value="">Colonnes</option>
        <option v-for="column in availableColumns" :key="column.value" :value="column.value">
          {{ column.label }}
        </option>
      </select>
      
      <input 
        v-model="searchQuery"
        class="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600" 
        placeholder="Recherche..." 
        type="search"
      />
      

    </div>

    <!-- Tableau des contrats -->
    <div class=" border border-gray-200 rounded-lg">
      <table class="w-[1024px] text-left text-xs text-gray-600 border-collapse">
        <thead class="bg-gray-50 w-full border-b border-gray-200">
          <tr>
            <th class="py-2 px-3 font-semibold w-[2.5rem]">#</th>
            <th class="py-2 px-3 font-semibold min-w-[8rem]">Nom</th>
            <th class="py-2 px-3 font-semibold min-w-[14rem]">Adresse</th>
            <th class="py-2 px-3 font-semibold min-w-[10rem]">bailleur</th>
            <th class="py-2 px-3 font-semibold min-w-[12rem]">Dates du contrat</th>
            <th class="py-2 px-3 font-semibold min-w-[7rem]">Statut</th>
            <th class="py-2 px-3 w-[2.5rem]"></th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(contract, index) in filteredContracts" 
            :key="contract.id"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            @click="$emit('contract-click', contract)"
          >
            <td class="py-2 px-3 font-semibold text-gray-500">
              {{ String(index + 1).padStart(2, '0') }}
            </td>
            <td class="py-2 px-3">
              {{ contract.name }}
            </td>
            <td class="py-2 px-3">
              {{ contract.address }}
            </td>
            <td class="py-2 px-3">
              <div class="font-semibold text-blue-600 hover:underline cursor-pointer">
                {{ contract.landlord?.firstName }} {{ contract.landlord?.lastName }}
              </div>
              <div class="text-xs text-gray-500">
                {{ contract.landlord?.email }}
              </div>
            </td>
            <td class="py-2 px-3 text-gray-500">
              {{ formatDateRange(contract.startDate, contract.endDate) }}
            </td>
            <td class="py-2 px-3">
              <span 
                class="font-semibold"
                :class="getStatusClass(contract.status)"
              >
                {{ getStatusText(contract.status) }}
              </span>
            </td>
            <td class="py-2 px-3 text-gray-400 hover:text-gray-600 cursor-pointer">
              <i class="fas fa-ellipsis-v"></i>
            </td>
          </tr>
          
          <tr v-if="filteredContracts.length === 0">
            <td colspan="7" class="py-4 text-center text-gray-500">
              Aucun contrat trouvé
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <footer class="flex flex-col sm:flex-row justify-between items-center mt-6 text-xs text-gray-500 gap-4">
      <div>
        {{ currentPage * itemsPerPage - itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, totalItems) }} sur {{ totalItems }} éléments
      </div>
      <nav class="flex items-center space-x-1">
        <button 
          aria-label="Page précédente" 
          class="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <template v-for="page in totalPages" :key="page">
          <button 
            v-if="showPageButton(page)"
            class="w-8 h-8 rounded-md"
            :class="{
              'font-semibold text-gray-900': currentPage === page,
              'text-gray-600 hover:text-gray-900': currentPage !== page
            }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <span 
            v-else-if="showEllipsis(page)" 
            class="px-2 text-gray-400"
          >
            ...
          </span>
        </template>
        
        <button 
          aria-label="Page suivante" 
          class="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Émits
const emit = defineEmits([
  'contract-click',
  'add-contract',
  'notifications-click',
  'update:currentPage',
  'update:searchQuery'
]);

// Props
const props = withDefaults(defineProps<{
  contracts: Contract[];
  itemsPerPage?: number;
  userAvatar?: string;
}>(), {
  itemsPerPage: 10,
  userAvatar: 'https://storage.googleapis.com/a1aa/image/66d62902-f9f1-4694-0f1c-b27f90b7b9f0.jpg'
});

// Types
type ContractStatus = 'active' | 'pending' | 'ended' | 'cancelled';

interface Landlord {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Contract {
  id: string | number;
  name: string;
  address: string;
  landlord: Landlord;
  startDate: string | Date;
  endDate: string | Date | null;
  status: ContractStatus;
  paymentStatus?: string;
  paymentDays?: number;
}

// Données réactives
const searchQuery = ref('');
const selectedColumns = ref('');
const currentPage = ref(1);

// Colonnes disponibles pour le filtre
const availableColumns = [
  { value: 'name', label: 'Nom' },
  { value: 'address', label: 'Adresse' },
  { value: 'tenant', label: 'Locataire' },
  { value: 'dates', label: 'Dates du contrat' },
  { value: 'status', label: 'Statut' }
];

// Utilisation des contrats passés en props
const contractsList = computed(() => props.contracts || []);

// Computed
const filteredContracts = computed(() => {
  // Filtrer par terme de recherche
  let result = [...contractsList.value];
  // Filtrer par colonnes sélectionnées (sécurité contre l'accès par index de chaîne)
  if (selectedColumns.value) {
    const column = selectedColumns.value as keyof Contract;
    result = result.filter(contract => {
      if (column in contract) {
        return contract[column];
      }
      return true; // Si la colonne n'existe pas, on garde le contrat
    });
  }
  // Pagination
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return result.slice(start, end);
});

const totalItems = computed(() => contractsList.value.length);
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / props.itemsPerPage);
});

// Méthodes
const formatDateRange = (startDate: string | Date, endDate: string | Date | null): string => {
  const start = new Date(startDate);
  const startStr = start.toLocaleDateString('fr-FR');
  
  if (!endDate) return `${startStr} - Indéfini`;
  
  const end = new Date(endDate);
  const endStr = end.toLocaleDateString('fr-FR');
  
  return `${startStr} - ${endStr}`;
};

const getStatusClass = (status: ContractStatus): string => {
  const classes = {
    active: 'text-green-600',
    pending: 'text-yellow-600',
    ended: 'text-red-500',
    cancelled: 'text-red-500',
    default: 'text-gray-600'
  };
  
  return classes[status] || classes.default;
};

const getStatusText = (status: ContractStatus): string => {
  const texts = {
    active: 'Actif',
    pending: 'En attente',
    ended: 'Terminé',
    cancelled: 'Annulé',
    default: 'Inconnu'
  };
  
  return texts[status] || texts.default;
};

const showPageButton = (page: number): boolean => {
  // Afficher les 2 premières pages, la page actuelle et les 2 suivantes, et les 2 dernières pages
  return (
    page <= 2 || 
    page >= totalPages.value - 1 || 
    (page >= currentPage.value - 1 && page <= currentPage.value + 1)
  );
};

const showEllipsis = (page: number): boolean => {
  // Afficher les points de suspension après les 2 premières pages et avant les 2 dernières
  return page === 3 && currentPage.value > 3 || 
         page === totalPages.value - 2 && currentPage.value < totalPages.value - 2;
};

// Lifecycle
onMounted(() => {
  // Ici, vous pourriez charger les données des contrats depuis une API
});
</script>

<style scoped>
/* Styles spécifiques au composant */
table {
  min-width: 1024px;
}

@media (max-width: 1024px) {
  table {
    min-width: 100%;
  }
}

/* Style pour rendre la table plus lisible sur mobile */
@media (max-width: 768px) {
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
    overflow-x: none;
  }
}
</style>
