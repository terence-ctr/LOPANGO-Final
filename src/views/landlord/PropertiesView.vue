<template>
  <div class="bg-white text-gray-900 min-h-screen p-6">
    <section class="mb-4 flex flex-wrap gap-3 items-center">
      <button
        class="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
        type="button"
      >
        <i class="fas fa-sliders-h text-xs"></i>
        <span>Filter</span>
        <i class="fas fa-chevron-down text-xs"></i>
      </button>
      <select
        aria-label="Colonnes"
        class="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
      >
        <option>Colonnes</option>
      </select>
      <input
        v-model="search"
        class="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
        placeholder="Recherche..."
        type="search"
      />

      <button
        @click="openAddPropertyModal"
        class="ml-auto bg-blue-900 text-white rounded-md px-5 py-2 text-sm font-semibold hover:bg-blue-800"
        type="button"
      >
        Ajouter
      </button>
    </section>

    <!-- Modal d'ajout de propriété -->
    <div v-if="isAddPropertyModalOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-h-[90vh] w-full max-w-xl mx-4 overflow-y-auto shadow-xl">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Ajouter une propriété</h2>
            <button @click="isAddPropertyModalOpen = false" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <PropertyForm
            :property="propertyData || undefined"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <section v-else class="border border-gray-200 rounded-md overflow-hidden">
      <!-- Loading state -->
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement de vos propriétés...</p>
      </div>
      
      <!-- Message quand il n'y a pas de propriétés -->
      <div v-else-if="!properties || properties.length === 0" class="p-8 text-center text-gray-500">
        <div class="mx-auto w-16 h-16 mb-4 text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-700">Aucune propriété trouvée</h3>
        <p class="mt-1 text-sm">Commencez par ajouter votre première propriété</p>
        <button
          @click="openAddPropertyModal"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i class="fas fa-plus mr-2"></i>
          Ajouter une propriété
        </button>
      </div>

      <!-- Tableau des propriétés -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-600">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="py-3 px-4 font-semibold w-12">#</th>
              <th class="py-3 px-4 font-semibold min-w-[120px]">Nom</th>
              <th class="py-3 px-4 font-semibold min-w-[280px]">Adresse</th>
              <th class="py-3 px-4 font-semibold min-w-[140px]">Type</th>
              <th class="py-3 px-4 font-semibold w-20">Loyer mensuel</th>
              <th class="py-3 px-4 font-semibold w-20">Statut</th>
              <th class="py-3 px-4 font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(property, index) in filteredProperties"
              :key="property.id"
              class="border-b border-gray-100"
            >
              <td class="py-3 px-4 font-normal">{{ property.id }}</td>
              <td class="py-3 px-4 font-normal">{{ property.title }}</td>
              <td
                class="py-3 px-4 font-normal whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]"
                :title="formatAddress(property.address)"
              >
                {{ formatAddress(property.address) }}
              </td>
              <td class="py-3 px-4 font-normal">{{ getPropertyTypeLabelText(property.type) }}</td>
              <td class="py-3 px-4 font-normal">{{ formatCurrency(property.rent) }}</td>
              <td
                class="py-3 px-4 font-semibold flex items-center gap-1"
                :class="getStatusClass(property.status)"
              >
                <template v-if="property.status === 'DISPONIBLE'">
                  <i class="fas fa-arrow-up text-green-600 text-[10px]"></i>
                </template>
                {{ getStatusLabelText(property.status) }}
              </td>
              <td class="py-3 px-4 relative text-center">
                <button
                  aria-expanded="false"
                  aria-haspopup="true"
                  aria-label="Actions"
                  class="text-gray-400 hover:text-gray-600 focus:outline-none"
                  @click="toggleMenu(String(property.id))"
                >
                  <i class="fas fa-ellipsis-h"></i>
                </button>
                <div
                  v-if="openMenuId === String(property.id)"
                  class="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-md shadow-lg text-xs z-10"
                  role="menu"
                >
                  <button
                    class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-gray-700"
                    role="menuitem"
                    @click="viewPropertyDetails(property)"
                  >
                    <i class="fas fa-eye"></i> Voir détails
                  </button>
                  <button
                    class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-gray-700"
                    role="menuitem"
                    @click="editProperty(property)"
                  >
                    <i class="fas fa-pen"></i> Éditer
                  </button>
                  <button
                    class="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-500"
                    role="menuitem"
                    @click="openModal('delete', property)"
                  >
                    <i class="fas fa-trash-alt"></i> Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal Overlay -->
    <div
      v-if="modalVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg max-w-md w-full mx-4 p-6 relative shadow-2xl">
        <button
          aria-label="Close modal"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          @click="closeModal"
        >
          <i class="fas fa-times"></i>
        </button>

        <template v-if="modalType === 'delete' && propertyData">
          <h3 class="text-lg font-bold text-gray-800 mb-2">
            Confirmer la suppression
          </h3>
          <p class="text-sm text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer la propriété
            <strong class="font-semibold">"{{ propertyData.title }}"</strong>? Cette
            action est irréversible.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              type="button"
            >
              Annuler
            </button>
            <button
              @click="confirmDelete"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              type="button"
            >
              Supprimer
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // ...
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { storeToRefs } from 'pinia';
import PropertyForm from '@/components/landlord/properties/PropertyForm.vue';
import { usePropertyStore } from '@/stores/propertyStore';
import { 
  type Property, 
  type PropertyStatus,
  type PropertyAddress,
  propertyStatusLabels,
  propertyTypeLabels
} from '@/types/property';

// Store, router, toast
const router = useRouter();
const toast = useToast();
const propertyStore = usePropertyStore();

// Access store state with proper typing
const { getProperties, isLoading, propertyError } = storeToRefs(propertyStore);

// Create local refs with proper types
const properties = ref<Property[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Initialize data
onMounted(async () => {
  await loadProperties();
});

// Function to load properties from store
const loadProperties = async () => {
  loading.value = true;
  try {
    await propertyStore.fetchProperties();
    properties.value = propertyStore.getProperties || [];
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load properties';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Local component state
const search = ref('');
const openMenuId = ref<string | null>(null);
const modalVisible = ref(false);
const modalType = ref<'edit' | 'delete' | null>(null);
const isAddPropertyModalOpen = ref(false);
const propertyData = ref<Partial<Property> | null>(null);

// Format address for display
const formatAddress = (address: string | PropertyAddress): string => {
  if (typeof address === 'string') return address;
  return `${address.street || ''}, ${address.postal_code || ''} ${address.city || ''}`.trim();
};

// Computed properties
const filteredProperties = computed(() => {
  if (!search.value) return properties.value;
  
  const searchLower = search.value.toLowerCase();
  
  return properties.value.filter((p) => {
    // Handle address which can be string or PropertyAddress object
    let addressStr = '';
    if (typeof p.address === 'string') {
      addressStr = p.address.toLowerCase();
    } else if (p.address) {
      const addr = p.address as PropertyAddress;
      addressStr = `${addr.street || ''} ${addr.city || ''} ${addr.postal_code || ''}`.toLowerCase();
    }
    
    // Safe property access with optional chaining
    const title = p.title?.toLowerCase() || '';
    const type = p.type?.toLowerCase() || '';
    
    return (
      title.includes(searchLower) ||
      addressStr.includes(searchLower) ||
      type.includes(searchLower)
    );
  });
});

// Methods
const formatCurrency = (amount: number, currency = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
};

const getStatusLabelText = (status: PropertyStatus): string => {
  return propertyStatusLabels[status] || status;
};

const getPropertyTypeLabelText = (type: string): string => {
  return propertyTypeLabels[type as keyof typeof propertyTypeLabels] || type;
};

const getStatusClass = (status: PropertyStatus): string => {
  const statusClasses: Record<string, string> = {
    DISPONIBLE: 'text-green-600',
    LOUE: 'text-blue-600',
    EN_MAINTENANCE: 'text-pink-600',
    EN_ENTRETIEN: 'text-yellow-600',
    VENDU: 'text-red-600',
    INDISPONIBLE: 'text-gray-600',
    RESERVE: 'text-purple-600',
    EN_NEGOCIATION: 'text-orange-600',
  };
  return statusClasses[status] || 'text-gray-600';
};

const openAddPropertyModal = () => {
  propertyData.value = null;
  isAddPropertyModalOpen.value = true;
};

const handleSubmit = () => {
  isAddPropertyModalOpen.value = false;
  propertyStore.fetchProperties();
};

const handleCancel = () => {
  isAddPropertyModalOpen.value = false;
};

// loadProperties is already defined above with async/await pattern

const toggleMenu = (id: string | number) => {
  const menuId = String(id);
  openMenuId.value = openMenuId.value === menuId ? null : menuId;
};

const openModal = (type: 'edit' | 'delete', property: Property) => {
  openMenuId.value = null;
  modalType.value = type;
  modalVisible.value = true;

  if (type === 'delete') {
    propertyData.value = property;
  }
};

const closeModal = () => {
  modalVisible.value = false;
  modalType.value = null;
  propertyData.value = null;
};

const editProperty = (property: Property) => {
  if (property.id) {
    router.push({ name: 'landlord-property-edit', params: { id: property.id } });
  }
};

const viewPropertyDetails = (property: Property) => {
  if (property.id) {
    router.push({ name: 'landlord-property-details', params: { id: property.id } });
  }
};

const confirmDelete = async () => {
  if (!propertyData.value?.id) return;
  try {
    await propertyStore.deleteProperty(Number(propertyData.value.id));
    toast.success('Propriété supprimée avec succès');
    closeModal();
  } catch (err) {
    toast.error('Erreur lors de la suppression.');
  }
};

onMounted(() => {
  loadProperties();
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest("button[aria-label='Actions']") && !target.closest("div[role='menu']")) {
      openMenuId.value = null;
    }
  });
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

body {
  font-family: "Inter", sans-serif;
}
</style> 