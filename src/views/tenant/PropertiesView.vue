<template>
  <div class="container mx-auto px-4 py-8">
    <!-- En-tête avec titre et bouton d'ajout -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isTenantView ? 'Mes biens' : 'Tous les biens' }}
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          {{ filteredProperties.length }} biens trouvés
        </p>
      </div>
      <button 
        v-if="!isTenantView"
        @click="handleAddProperty"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center w-full sm:w-auto justify-center"
      >
        <i class="fas fa-plus mr-2"></i> Ajouter un bien
      </button>
    </div>
    
    <!-- Filtres et recherche -->
    <div class="bg-white p-4 rounded-lg shadow mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Barre de recherche -->
        <div class="relative">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Rechercher un bien..."
            class="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="handleSearch"
          >
          <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        </div>
        
        <!-- Filtre par statut -->
        <select 
          v-model="statusFilter"
          class="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option 
            v-for="status in propertyStatuses" 
            :key="status.value"
            :value="status.value"
          >
            {{ status.label }}
          </option>
        </select>
        
        <!-- Filtre par type -->
        <select 
          v-model="typeFilter"
          class="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tous les types</option>
          <option 
            v-for="type in propertyTypes" 
            :key="type.value"
            :value="type.value"
          >
            {{ type.label }}
          </option>
        </select>
        
        <!-- Bouton de réinitialisation -->
        <button 
          @click="resetFilters"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center"
        >
          <i class="fas fa-undo-alt mr-2"></i> Réinitialiser
        </button>
      </div>
    </div>
    
    <!-- Chargement -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <!-- Message si pas de résultats -->
    <div v-else-if="filteredProperties.length === 0" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-8 text-center">
        <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-4">
          <i class="fas fa-home text-blue-600 text-3xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun bien trouvé</h3>
        <p class="text-gray-500 mb-6">Aucun bien ne correspond à vos critères de recherche.</p>
        <button 
          @click="resetFilters"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
    
    <!-- Liste des propriétés -->
    <div v-else class="space-y-6">
      <!-- En-tête de la liste -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="text-sm text-gray-600">
          Affichage de <span class="font-medium">{{ paginatedProperties.length }}</span> biens sur <span class="font-medium">{{ filteredProperties.length }}</span>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Boutons de vue -->
          <div class="hidden sm:flex bg-gray-100 p-1 rounded-md">
            <button 
              @click="viewMode = 'grid'"
              class="p-2 rounded-md"
              :class="{ 'bg-white shadow-sm': viewMode === 'grid' }"
              title="Vue en grille"
            >
              <i class="fas fa-th"></i>
            </button>
            <button 
              @click="viewMode = 'list'"
              class="p-2 rounded-md"
              :class="{ 'bg-white shadow-sm': viewMode === 'list' }"
              title="Vue en liste"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
          
          <!-- Sélecteur d'éléments par page -->
          <div class="flex items-center">
            <label for="itemsPerPage" class="text-sm text-gray-600 mr-2">Afficher :</label>
            <select 
              id="itemsPerPage"
              v-model="itemsPerPage"
              class="pl-2 pr-8 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
              <option value="96">96</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Grille des propriétés -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <PropertyCard
          v-for="property in paginatedProperties"
          :key="property.id || property._id"
          :property="property"
          :is-favorite="isFavorite(property)"
          @view-details="viewPropertyDetails"
          @toggle-favorite="toggleFavorite"
          @contact-owner="contactOwner"
        />
      </div>
      
      <!-- Liste des propriétés -->
      <div v-else class="space-y-4">
        <PropertyListItem
          v-for="property in paginatedProperties"
          :key="property.id || property._id"
          :property="property"
          :is-favorite="isFavorite(property)"
          @view-details="viewPropertyDetails"
          @toggle-favorite="toggleFavorite"
        />
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
        <div class="text-sm text-gray-600">
          Page {{ currentPage }} sur {{ totalPages }}
        </div>
        
        <div class="flex items-center space-x-1">
          <button 
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded-md border"
            :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
            title="Première page"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
          
          <button 
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded-md border"
            :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
            title="Page précédente"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <!-- Boutons de page -->
          <template v-for="page in visiblePages" :key="page">
            <button 
              v-if="page === '...'"
              class="px-3 py-1 text-gray-500"
              disabled
            >
              {{ page }}
            </button>
            <button 
              v-else
              @click="currentPage = Number(page)"
              class="w-10 h-8 rounded-md"
              :class="currentPage === Number(page) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'"
            >
              {{ page }}
            </button>
          </template>
          
          <button 
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded-md border"
            :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
            title="Page suivante"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
          
          <button 
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded-md border"
            :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
            title="Dernière page"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal d'ajout/édition -->
    <PropertyFormModal
      v-if="showAddPropertyForm"
      :property="selectedProperty"
      @close="showAddPropertyForm = false"
      @submit="handlePropertySubmit"
    />
    
    <!-- Modal de détails -->
    <PropertyDetailsModal
      v-if="showPropertyDetails && selectedProperty"
      :property="selectedProperty"
      :is-favorite="isFavorite(selectedProperty)"
      @close="showPropertyDetails = false"
      @toggle-favorite="toggleFavorite"
      @contact-owner="contactOwner"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';
import { usePropertyStore } from '@/stores/propertyStore';
import type { Property } from '@/types/property';

// Composants
const PropertyCard = defineAsyncComponent(() => import('@/components/properties/PropertyCard.vue'));
const PropertyListItem = defineAsyncComponent(() => import('@/components/properties/PropertyListItem.vue'));
const PropertyFormModal = defineAsyncComponent(() => import('@/components/properties/PropertyFormModal.vue'));
const PropertyDetailsModal = defineAsyncComponent(() => import('@/components/properties/PropertyDetailsModal.vue'));

// Store et route
const authStore = useAuthStore();
const propertyStore = usePropertyStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

// État local
const isLoading = ref(false);
const showAddPropertyForm = ref(false);
const showPropertyDetails = ref(false);
const selectedProperty = ref<Property | null>(null);
const viewMode = ref<'grid' | 'list'>('grid');
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(12);

// Options pour les filtres
const propertyStatuses = [
  { value: '', label: 'Tous les statuts' },
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'LOUE', label: 'Loué' },
  { value: 'EN_MAINTENANCE', label: 'En maintenance' }
];

const propertyTypes = [
  { value: '', label: 'Tous les types' },
  { value: 'APPARTEMENT', label: 'Appartement' },
  { value: 'MAISON', label: 'Maison' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'BUREAU', label: 'Bureau' },
  { value: 'LOCAL_COMMERCIAL', label: 'Local commercial' }
];

// Favoris
const favoriteProperties = ref<Set<string | number>>(new Set());

// Propriétés calculées
const isTenantView = computed(() => route.name === 'tenant-properties');

const properties = computed<Property[]>(() => {
  if (isTenantView.value) {
    return (propertyStore as any).getTenantProperties || [];
  } else {
    return (propertyStore as any).getProperties || [];
  }
});

const filteredProperties = computed<Property[]>(() => {
  return properties.value.filter(property => {
    // Filtre par recherche
    const matchesSearch = !searchQuery.value || 
      property.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (typeof property.address === 'string' 
        ? property.address.toLowerCase().includes(searchQuery.value.toLowerCase())
        : property.address?.street?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          property.address?.city?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          property.address?.postal_code?.includes(searchQuery.value)
      );
    
    // Filtre par statut
    const matchesStatus = !statusFilter.value || property.status === statusFilter.value;
    
    // Filtre par type
    const matchesType = !typeFilter.value || property.type === typeFilter.value;
    
    return matchesSearch && matchesStatus && matchesType;
  });
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredProperties.value.length / itemsPerPage.value));

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredProperties.value.slice(start, end);
});

const visiblePages = computed<Array<number | string>>(() => {
  const pages: (number | string)[] = [];
  const maxVisible = 5;
  
  if (totalPages.value <= maxVisible) {
    // Moins de pages que le maximum visible, on les affiche toutes
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Ajouter la première page
    pages.push(1);
    
    // Calculer le début et la fin de la plage de pages à afficher
    let start = Math.max(2, currentPage.value - 1);
    let end = Math.min(totalPages.value - 1, currentPage.value + 1);
    
    // Ajuster si on est proche du début ou de la fin
    if (currentPage.value <= 3) {
      end = 4;
    } else if (currentPage.value >= totalPages.value - 2) {
      start = totalPages.value - 3;
    }
    
    // Ajouter les points de suspension avant si nécessaire
    if (start > 2) {
      pages.push('...');
    }
    
    // Ajouter les pages intermédiaires
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages.value) {
        pages.push(i);
      }
    }
    
    // Ajouter les points de suspension après si nécessaire
    if (end < totalPages.value - 1) {
      pages.push('...');
    }
    
    // Ajouter la dernière page
    pages.push(totalPages.value);
  }
  
  return pages;
});

// Méthodes
const loadProperties = async () => {
  try {
    isLoading.value = true;
    if (isTenantView.value) {
      await propertyStore.fetchTenantProperties();
    } else {
      await propertyStore.fetchProperties();
    }
  } catch (error) {
    console.error('Erreur lors du chargement des propriétés :', error);
    toast.error('Une erreur est survenue lors du chargement des propriétés');
  } finally {
    isLoading.value = false;
  }
};

const handleAddProperty = () => {
  selectedProperty.value = null;
  showAddPropertyForm.value = true;
};

const handlePropertySubmit = async (propertyData: any) => {
  try {
    if (propertyData.id) {
      await propertyStore.updateProperty(propertyData.id, propertyData);
      toast.success('Propriété mise à jour avec succès');
    } else {
      await propertyStore.createProperty(propertyData);
      toast.success('Propriété créée avec succès');
    }
    showAddPropertyForm.value = false;
    await loadProperties();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la propriété :', error);
    toast.error('Une erreur est survenue lors de la sauvegarde de la propriété');
  }
};

const viewPropertyDetails = (property: Property) => {
  selectedProperty.value = property;
  showPropertyDetails.value = true;
};

const toggleFavorite = (property: Property) => {
  const propertyId = (property.id || property._id) as string | number;
  if (!propertyId) return;
  
  if (favoriteProperties.value.has(propertyId)) {
    favoriteProperties.value.delete(propertyId);
    toast.success('Propriété retirée des favoris');
  } else {
    favoriteProperties.value.add(propertyId);
    toast.success('Propriété ajoutée aux favoris');
  }
};

const isFavorite = (property: Property) => {
  const propertyId = (property.id || property._id) as string | number;
  return propertyId ? favoriteProperties.value.has(propertyId) : false;
};

const contactOwner = (property: Property) => {
  // Implémentez la logique pour contacter le propriétaire
  console.log('Contacter le propriétaire :', property);
  toast.info('Fonctionnalité de contact à implémenter');
};

const handleSearch = () => {
  currentPage.value = 1; // Réinitialiser à la première page lors d'une nouvelle recherche
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  typeFilter.value = '';
  currentPage.value = 1;
};

// Watchers
watch([currentPage, itemsPerPage], () => {
  // Faire défiler vers le haut lors du changement de page
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Chargement initial
onMounted(() => {
  loadProperties();
});
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
