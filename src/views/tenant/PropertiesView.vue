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
    <div class="bg-white rounded-lg shadow-sm mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3">
        <!-- Barre de recherche -->
        <div>
          <label for="search" class="block text-xs font-medium text-gray-600 mb-1">
            Rechercher
          </label>
          <div class="relative">
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par titre ou adresse..."
              class="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              @input="handleSearch"
            >
            <i class="fas fa-search absolute right-3 top-2 text-gray-400 text-sm"></i>
          </div>
        </div>
        
        <!-- Filtre par statut -->
        <div>
          <label for="status" class="block text-xs font-medium text-gray-600 mb-1">
            Statut
          </label>
          <select
            id="status"
            v-model="statusFilter"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="LOUE">Loué</option>
            <option value="EN_MAINTENANCE">En maintenance</option>
          </select>
        </div>
        
        <!-- Filtre par type -->
        <div>
          <label for="type" class="block text-xs font-medium text-gray-600 mb-1">
            Type
          </label>
          <select
            id="type"
            v-model="typeFilter"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Tous les types</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="MAISON">Maison</option>
            <option value="VILLA">Villa</option>
            <option value="BUREAU">Bureau</option>
            <option value="LOCAL_COMMERCIAL">Local commercial</option>
          </select>
        </div>
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
    <div v-else class="bg-white shadow-sm overflow-hidden border border-gray-200 rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propriété
              </th>
              <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" class="relative px-4 py-2">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <!-- Message si pas de propriétés -->
            <tr v-if="paginatedProperties.length === 0">
              <td colspan="8" class="px-4 py-6 text-center text-gray-500">
                <div class="flex flex-col items-center space-y-3">
                  <i class="fas fa-home text-3xl text-gray-300 mb-2"></i>
                  <p class="text-base font-medium">Aucune propriété trouvée</p>
                  <p class="text-sm text-gray-600">
                    Aucune propriété ne correspond à vos critères de recherche.
                  </p>
                  <button 
                    @click="resetFilters"
                    class="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Liste des propriétés -->
            <tr 
              v-for="property in paginatedProperties" 
              :key="property.id || property._id"
              class="hover:bg-gray-50"
            >
              <!-- Propriété -->
              <td class="px-4 py-3">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                    <i class="fas fa-home text-gray-500"></i>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">
                      {{ property.title || 'Propriété sans nom' }}
                    </div>
                  </div>
                </div>
              </td>
              
              <!-- Adresse -->
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatAddress(property.address) }}
                </div>
              </td>
              
              <!-- Type -->
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ property.type }}
                </div>
              </td>
              
              <!-- Prix -->
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(property.rent) }}
                </div>
              </td>
              
              <!-- Statut -->
              <td class="px-4 py-3 whitespace-nowrap">
                <span 
                  :class="getStatusBadgeClass(property.status)"
                  class="px-1.5 inline-flex text-xs leading-4 font-semibold rounded-full"
                >
                  {{ formatPropertyStatus(property.status) }}
                </span>
              </td>
              
              <!-- Actions -->
              <td class="px-4 py-3">
                <!-- Menu déroulant avec points de suspension -->
                <div class="relative">
                  <button 
                    @click="selectedProperty = property; showActionMenu = !showActionMenu"
                    class="text-blue-600 hover:text-blue-800"
                    title="Actions"
                  >
                    <i class="fas fa-ellipsis-h text-sm"></i>
                  </button>

                  <!-- Menu déroulant -->
                  <div 
                    v-if="showActionMenu && selectedProperty === property"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                    @click="showActionMenu = false"
                  >
                    <div class="py-1">
                      <button
                        @click="handlePropertyDetails(property)"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <i class="fas fa-eye mr-2"></i>
                        Détails
                      </button>
                     
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination -->
      
      </div>
    </div>
    <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :items-per-page="itemsPerPage"
          @update:current-page="currentPage = $event"
        />
    
    <PropertyFormModal
      v-if="showAddPropertyForm"
      :property="selectedProperty"
      @close="showAddPropertyForm = false"
      @submit="handlePropertySubmit"
    />
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { defineAsyncComponent } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import { Property, PropertyStatus } from '@/types/property';
import type { User } from '@/types/user';
import { usePropertyStore } from '@/stores/propertyStore';
import { NotificationService } from '@/services/notification.service';
import ContractService from '@/services/contract.service';

// Composants
const PropertyFormModal = defineAsyncComponent(() => import('@/components/properties/PropertyFormModal.vue'));
const PropertyCard = defineAsyncComponent(() => import('@/components/properties/PropertyCard.vue'));
const PropertyListItem = defineAsyncComponent(() => import('@/components/properties/PropertyListItem.vue'));
const PropertyDetailsModal = defineAsyncComponent(() => import('@/components/properties/PropertyDetailsModal.vue'));
const Pagination = defineAsyncComponent(() => import('@/components/ui/Pagination.vue'));

// Store et route
const authStore = useAuthStore();
const propertyStore = usePropertyStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

// État local
const isLoading = ref(false);
const showAddPropertyForm = ref(false);
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
  { value: 'EN_MAINTENANCE', label: 'En maintenance' },
  { value: 'EN_ENTRETIEN', label: 'En entretien' },
  { value: 'VENDU', label: 'Vendu' },
  { value: 'INDISPONIBLE', label: 'Indisponible' },
  { value: 'RESERVE', label: 'Réservé' },
  { value: 'EN_NEGOCIATION', label: 'En négociation' }
];

// État du menu d'action
const showActionMenu = ref(false);

// Méthodes pour le menu d'action
const handlePropertyDetails = (property: Property) => {
  // Vérifier si l'ID est un nombre
  const propertyId = parseInt(property.id?.toString() || property._id?.toString() || '');
  
  if (isNaN(propertyId)) {
    toast.error('ID de propriété invalide');
    return;
  }
  
  router.push({ name: 'tenant-property-details', params: { id: propertyId } });
  showActionMenu.value = false; // Fermer le menu après l'action
};

// La fonction editProperty a été supprimée car les locataires ne peuvent pas éditer les propriétés

const terminateContract = async (property: Property) => {
  // Vérifier que la propriété a un locataire
  if (!property.tenantId) {
    toast.error('Cette propriété n\'a pas de locataire');
    return;
  }

  // Vérifier que l\'utilisateur connecté est le locataire
  if (property.tenantId !== authStore.user?._id) {
    toast.error('Cette propriété ne vous appartient pas');
    return;
  }

  // Confirmation avant de procéder
  if (!confirm('Êtes-vous sûr de vouloir rompre le contrat ? Une notification sera envoyée au propriétaire pour confirmation.')) {
    return;
  }

  try {
    // Créer la notification pour le propriétaire
    const notificationData = {
      userId: property.ownerId as string,
      type: 'CONTRACT_TERMINATION_REQUEST',
      title: 'Demande de rupture de contrat',
      message: `Le locataire ${formatOwnerName(authStore.user as User)} souhaite rompre le contrat pour la propriété ${property.title}`,
      data: {
        propertyId: property._id,
        tenantId: property.tenantId,
        status: 'PENDING'
      }
    };

    // Envoyer la notification au propriétaire
    await NotificationService.createNotification(notificationData);
    
    // Mettre à jour le statut du contrat
    await ContractService.createContract({
      propertyId: property._id,
      tenantId: property.tenantId,
      status: 'TERMINATED'
    });

    toast.success('Votre demande de rupture de contrat a été envoyée au propriétaire. Vous serez notifié de la décision.');
    showActionMenu.value = false; // Fermer le menu après l'action
    await propertyStore.fetchProperties(); // Rafraîchir la liste des propriétés
  } catch (error) {
    console.error('Erreur lors de la demande de rupture de contrat:', error);
    toast.error('Une erreur est survenue lors de l\'envoi de la demande');
  }

  try {
    // Utiliser la méthode correcte pour rompre le contrat
    await ContractService.createContract({
      propertyId: property._id,
      tenantId: property.tenantId,
      status: 'TERMINATED'
    });
    toast.success('Le contrat a été rompu avec succès');
    await loadProperties();
    showActionMenu.value = false; // Fermer le menu après l'action
  } catch (error) {
    toast.error('Erreur lors de la rupture du contrat');
    console.error('Erreur lors de la rupture du contrat:', error);
  }
};

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

// Méthodes utilitaires
const formatAddress = (address: Property['address']) => {
  if (!address) return '';
  
  if (typeof address === 'string') {
    return address;
  }
  
  return `${address.street}, ${address.city} ${address.postal_code}, ${address.country}`;
};

const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const getStatusBadgeClass = (status: PropertyStatus) => {
  switch (status) {
    case 'DISPONIBLE':
      return 'bg-green-100 text-green-800';
    case 'LOUE':
      return 'bg-blue-100 text-blue-800';
    case 'EN_MAINTENANCE':
      return 'bg-yellow-100 text-yellow-800';
    case 'EN_ENTRETIEN':
      return 'bg-orange-100 text-orange-800';
    case 'VENDU':
      return 'bg-gray-100 text-gray-800';
    case 'INDISPONIBLE':
      return 'bg-red-100 text-red-800';
    case 'RESERVE':
      return 'bg-purple-100 text-purple-800';
    case 'EN_NEGOCIATION':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatPropertyStatus = (status: PropertyStatus) => {
  switch (status) {
    case 'DISPONIBLE':
      return 'Disponible';
    case 'LOUE':
      return 'Loué';
    case 'EN_MAINTENANCE':
      return 'En maintenance';
    case 'EN_ENTRETIEN':
      return 'En entretien';
    case 'VENDU':
      return 'Vendu';
    case 'INDISPONIBLE':
      return 'Indisponible';
    case 'RESERVE':
      return 'Réservé';
    case 'EN_NEGOCIATION':
      return 'En négociation';
    default:
      return status;
  }
};

const formatOwnerName = (user: User) => {
  return `${user.firstName} ${user.lastName}`;
};

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
