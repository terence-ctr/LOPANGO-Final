<template>
  <main class="flex-1 p-8">
    <!-- Formulaire d'ajout de propriété -->
    <div v-if="showAddPropertyForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div class="w-full max-w-2xl mt-10 mb-10">
        <BasePropertyForm
          :property="selectedProperty"
          :is-editing="!!selectedProperty"
          @submit="handlePropertySubmit"
          @cancel="showAddPropertyForm = false"
        />
      </div>
    </div>
    <header class="flex justify-between items-center mb-8">
      <h1 class="text-black font-extrabold text-lg leading-6 select-none">
        Mes propriétés
      </h1>
      <button 
        v-if="!isTenant"
        @click="handleAddProperty"
        class="bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold rounded px-4 py-2 flex items-center transition-colors duration-200"
      >
        <font-awesome-icon icon="plus" class="mr-2 text-xs" />
        Ajouter un logement
      </button>
    </header>
    
    <!-- Filters -->
    <div class="flex gap-3 mb-6 flex-wrap">
      <button class="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 hover:bg-gray-100" 
              type="button" @click="toggleFilters">
        <i class="fas fa-sliders-h text-xs"></i>
        Filtrer
        <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>
      
      <select v-model="filters.column" 
              class="border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600">
        <option value="">Colonnes</option>
        <option v-for="column in availableColumns" :key="column.value" :value="column.value">
          {{ column.label }}
        </option>
      </select>
      
      <input v-model="searchQuery"
             class="border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600" 
             placeholder="Recherche..." 
             type="search"
             @input="handleSearch" />
      
      <select v-model="filters.status" 
              class="border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600">
        <option value="">Statut</option>
        <option value="actif">Actif</option>
        <option value="inactif">Inactif</option>
      </select>
      
      <select v-model="filters.landlord" 
              class="border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600">
        <option value="">Bailleur</option>
        <option v-for="landlord in landlords" :key="landlord.id" :value="landlord.id">
          {{ landlord.name }}
        </option>
      </select>
    </div>
    
    <!-- Table -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">Gestion des propriétés</h2>
        <button 
          v-if="!isTenant"
          @click="handleAddProperty"
          class="bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold rounded px-4 py-2 flex items-center transition-colors duration-200"
        >
          <font-awesome-icon icon="plus" class="mr-2 text-xs" />
          Ajouter un logement
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border border-gray-200 rounded-lg text-left text-xs text-gray-600">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="py-2 px-3 font-semibold w-10">#</th>
              <th class="py-2 px-3 font-semibold">Nom de la propriété</th>
              <th class="py-2 px-3 font-semibold">Adresse</th>
              <th class="py-2 px-3 font-semibold">Bailleur</th>
              <th class="py-2 px-3 font-semibold">Loyer</th>
              <th class="py-2 px-3 font-semibold">Statut</th>
              <th class="py-2 px-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(property, index) in filteredProperties" :key="property.id" class="border-b border-gray-200">
              <td class="py-2 px-3 font-mono text-gray-700">{{ String(index + 1).padStart(2, '0') }}</td>
              <td class="py-2 px-3">{{ property.name }}</td>
              <td class="py-2 px-3">{{ property.address }}</td>
              <td class="py-2 px-3">
                <a class="text-blue-600 hover:underline" href="#">
                  {{ property.landlord }}
                </a>
              </td>
              <td class="py-2 px-3">{{ property.rent }} $</td>
              <td class="py-2 px-3">
                <span :class="['font-semibold', property.status === 'Actif' ? 'text-green-600' : 'text-red-500']">
                  {{ property.status }}
                </span>
              </td>
              <td class="py-2 px-3">
                <div class="relative flex justify-end">
                  <!-- Bouton de menu pour les écrans larges -->
                  <button 
                    @click.stop="openPropertyMenu(property, $event)" 
                    class="p-2 text-gray-500 hover:text-blue-600 focus:outline-none"
                    :class="{ 'text-blue-600': propertyMenuOpen === (property.id ? (typeof property.id === 'string' ? parseInt(property.id, 10) : property.id) : null) }"
                  >
                    <i class="fas fa-ellipsis-v">...</i>
                  </button>
                  
                  <!-- Menu déroulant pour les écrans larges -->
                  <div 
                    v-if="propertyMenuOpen === (property.id ? (typeof property.id === 'string' ? parseInt(property.id, 10) : property.id) : null)" 
                    class="absolute right-0 z-50 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    style="top: 100%;"
                    @click.stop
                  >
                    <div class="py-1">
                      <a 
                        href="#"
                        @click.prevent="viewProperty(property)" 
                        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <i class="fas fa-eye mr-2 text-gray-500 w-4"></i>
                        Voir les détails
                      </a>
                      <a 
                        href="#"
                        @click.prevent="reportProperty(property)" 
                        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        v-if="!isTenant"
                      >
                        <i class="fas fa-flag mr-2 text-yellow-500 w-4"></i>
                        Signaler
                      </a>
                    </div>
                  </div>
                </div>
                
                <!-- Boutons visibles uniquement sur mobile -->
                <div class="md:hidden flex space-x-2">
                  <a 
                    href="#"
                    @click.prevent="viewProperty(property)" 
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Voir les détails"
                  >
                    <i class="fas fa-eye"></i>
                  </a>
                  <a 
                    href="#"
                    @click.prevent="reportProperty(property)" 
                    class="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                    title="Signaler"
                    v-if="!isTenant"
                  >
                    <i class="fas fa-flag"></i>
                  </a>
                </div>
              </td>
            </tr>
            <tr v-if="filteredProperties.length === 0">
              <td colspan="7" class="py-4 text-center text-gray-500">
                Aucune propriété trouvée
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Pagination -->
    <div class="mt-4 flex justify-between items-center">
      <div class="text-sm text-gray-500">
        Affichage de {{ filteredProperties.length }} sur {{ properties.length }} propriétés
      </div>
      <div class="flex gap-2">
        <button :disabled="currentPage === 1" 
                @click="currentPage--" 
                class="px-3 py-1 border rounded-md text-sm"
                :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'">
          Précédent
        </button>
        <button v-for="page in totalPages" :key="page"
                @click="currentPage = page"
                class="w-8 h-8 rounded-md text-sm"
                :class="currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'">
          {{ page }}
        </button>
        <button :disabled="currentPage >= totalPages" 
                @click="currentPage++" 
                class="px-3 py-1 border rounded-md text-sm"
                :class="currentPage >= totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'">
          Suivant
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePropertyStore } from '@/stores/propertyStore';
import BasePropertyForm from '@/components/shared/properties/BasePropertyForm.vue';
import type { Property, PropertyStatus, PropertyType } from '@/types/property';

// User data
const userAvatar = ref('https://storage.googleapis.com/a1aa/image/7d7f78f6-345d-43be-edec-e470151ec5de.jpg');
const authStore = useAuthStore();
const propertyStore = usePropertyStore();

// Charger les propriétés au montage du composant
onMounted(async () => {
  try {
    await propertyStore.fetchProperties();
  } catch (error) {
    console.error('Erreur lors du chargement des propriétés:', error);
  }
});

// Propriétés réactives
const loading = computed(() => propertyStore.isLoading);
const error = computed(() => propertyStore.propertyError);

// Fonction utilitaire pour obtenir l'ID de la propriété
const getPropertyId = (property: { id?: string | number | null }): number | null => {
  if (property.id === undefined || property.id === null) return null;
  return typeof property.id === 'string' ? parseInt(property.id, 10) : property.id;
};

// Propriété sélectionnée avec le bon type
const selectedProperty = ref<Property | null>(null);

// Interface pour les propriétés formatées pour l'affichage
interface FormattedProperty {
  id?: string | number;
  name: string;
  address: string;
  landlord: string;
  status: 'Actif' | 'Inactif';
  title: string;
  rent: number;
  // Propriétés supplémentaires nécessaires pour le template
  description?: string;
  type: PropertyType;
  area?: number;
  rooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  // Index signature pour les propriétés dynamiques
  [key: string]: unknown;
}

// Fonction utilitaire pour convertir le statut d'affichage en PropertyStatus
const mapStatusToPropertyStatus = (status: 'Actif' | 'Inactif'): string => {
  return status === 'Actif' ? 'DISPONIBLE' : 'INDISPONIBLE';
};

const properties = computed<FormattedProperty[]>(() => {
  return propertyStore.getProperties.map(property => {
    // Gérer l'adresse qui peut être une chaîne ou un objet
    const address = typeof property.address === 'string' 
      ? property.address 
      : `${property.address?.street || ''}, ${property.address?.postal_code || ''} ${property.address?.city || ''}`;
    
    // Créer un objet de propriété formaté avec toutes les propriétés nécessaires
    const formattedProperty: FormattedProperty = {
      id: property.id,
      name: property.title || 'Sans nom',
      address: address,
      // Utiliser ownerId au lieu de landlord_id qui n'existe pas dans le type Property
      landlord: (property as any).ownerId ? `Propriétaire ${(property as any).ownerId}` : 'Propriétaire inconnu',
      status: property.status === 'DISPONIBLE' ? 'Actif' : 'Inactif',
      title: property.title || 'Sans titre',
      rent: property.rent || 0,
      // Propriétés supplémentaires avec des valeurs par défaut
      description: (property as any).description || '',
      type: (property as any).type || 'APPARTEMENT',
      area: (property as any).area || 0,
      rooms: (property as any).rooms || 0,
      bathrooms: (property as any).bathrooms || 0,
      furnished: (property as any).furnished || false
    };
    
    return formattedProperty;
  });
});

// Filters and search
const filters = ref({
  status: '',
  landlord: '',
  column: ''
});

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Inverser la logique pour afficher le bouton Signaler pour les locataires
const isTenant = computed(() => authStore.user?.userType === 'tenant');

// Gestion du menu déroulant des propriétés
const propertyMenuOpen = ref<number | null>(null);

const showAddPropertyForm = ref(false);
const showFilters = ref(false);


// Computed properties
const filteredProperties = computed<FormattedProperty[]>(() => {
  return properties.value.filter(property => {
    try {
      const searchTerm = searchQuery.value?.toLowerCase() || '';
      const propertyName = property.name?.toLowerCase() || '';
      const propertyAddress = (typeof property.address === 'string' ? property.address : '').toLowerCase();
      const propertyLandlord = property.landlord?.toLowerCase() || '';
      
      const matchesSearch = !searchTerm || 
        propertyName.includes(searchTerm) ||
        propertyAddress.includes(searchTerm) ||
        propertyLandlord.includes(searchTerm);
      
      const matchesStatus = !filters.value.status || 
        (filters.value.status === 'actif' ? 'Actif' : 'Inactif') === property.status;
        
      const matchesLandlord = !filters.value.landlord || 
        (propertyLandlord && 
        propertyLandlord.includes(filters.value.landlord.toLowerCase()));
      
      return matchesSearch && matchesStatus && matchesLandlord;
    } catch (error) {
      console.error('Erreur lors du filtrage des propriétés:', error);
      return false; // Exclure les propriétés qui provoquent des erreurs
    }
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredProperties.value.length / itemsPerPage);
});

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredProperties.value.slice(start, start + itemsPerPage);
});

// Available columns for filtering
const availableColumns = [
  { value: 'name', label: 'Nom' },
  { value: 'address', label: 'Adresse' },
  { value: 'landlord', label: 'Bailleur' },
  { value: 'rent', label: 'Loyer' },
  { value: 'status', label: 'Statut' }
];

// Propriétaires disponibles
interface Landlord {
  id: number | string;
  name: string;
}

const landlords = computed<Landlord[]>(() => {
  // Extraire les propriétaires uniques des propriétés
  const uniqueLandlords = new Map<string, Landlord>();
  
  propertyStore.getProperties.forEach(property => {
    if (property.ownerId) {
      const id = property.ownerId.toString();
      if (!uniqueLandlords.has(id)) {
        uniqueLandlords.set(id, {
          id: property.ownerId,
          name: `Propriétaire ${id}` // À remplacer par le nom réel du propriétaire
        });
      }
    }
  });
  
  // Retourner les propriétaires uniques
  return Array.from(uniqueLandlords.values());
});

// Methods
const toggleFilters = () => {
  // Toggle filter visibility logic here
  console.log('Toggle filters');
};

const handleSearch = () => {
  currentPage.value = 1; // Reset to first page on new search
};

const viewProperty = async (property: FormattedProperty) => {
  try {
    const propertyId = getPropertyId(property);
    if (propertyId === null) return;
    
    // Charger les détails complets de la propriété
    await propertyStore.fetchPropertyById(propertyId);
    
        // Vérifier que la propriété a bien été chargée
    const currentProperty = propertyStore.getCurrentProperty;
    if (currentProperty) {
      // Créer un objet compatible avec le type Property
      const propertyData: Property = {
        ...currentProperty,
        // Assurer que les champs obligatoires sont présents
        id: currentProperty.id || '',
        _id: (currentProperty as any)._id || null,
        title: currentProperty.title || 'Sans titre',
        // S'assurer que le type est valide
        type: (['APPARTEMENT', 'MAISON', 'VILLA', 'CHATEAU', 'PARKING', 'LOCAL_COMMERCIAL', 'BUREAU', 'ENTREPOT', 'TERRAIN', 'AUTRE'].includes((currentProperty as any).type) 
          ? (currentProperty as any).type 
          : 'APPARTEMENT') as PropertyType,
        area: (currentProperty as any).area || 0,
        rooms: (currentProperty as any).rooms || 0,
        bathrooms: (currentProperty as any).bathrooms || 0,
        furnished: (currentProperty as any).furnished || false,
        rent: (currentProperty as any).rent || 0,
        status: mapStatusToPropertyStatus((currentProperty as any).status as 'Actif' | 'Inactif') as PropertyStatus,
        // Gérer l'adresse qui peut être une chaîne ou un objet
        address: typeof (currentProperty as any).address === 'string' 
          ? (currentProperty as any).address 
          : {
              street: (currentProperty as any).address?.street || '',
              city: (currentProperty as any).address?.city || '',
              postal_code: (currentProperty as any).address?.postal_code || '',
              country: (currentProperty as any).address?.country || 'congo'
            },
        // Autres champs obligatoires avec valeurs par défaut
        description: (currentProperty as any).description || '',
        slug: (currentProperty as any).slug || '',
        // Utiliser les noms de propriétés en camelCase selon l'interface Property
        createdAt: (currentProperty as any).createdAt || (currentProperty as any).created_at || new Date().toISOString(),
        updatedAt: (currentProperty as any).updatedAt || (currentProperty as any).updated_at || new Date().toISOString(),
        publishedAt: (currentProperty as any).publishedAt || (currentProperty as any).published_at || new Date().toISOString(),
        tags: (currentProperty as any).tags || []
      };
      
      selectedProperty.value = propertyData;
    }
    
    // Ici, vous pouvez rediriger vers une page de détail ou ouvrir une modale
    console.log('View property:', selectedProperty.value);
  } catch (error) {
    console.error('Erreur lors du chargement des détails de la propriété:', error);
    alert('Impossible de charger les détails de la propriété');
  }
};

const editProperty = (property: FormattedProperty) => {
  console.log('Edit property:', property);
  // Convertir FormattedProperty en Property
  const propertyData: Property = {
    ...property,
    _id: (property as any)._id || null,
    status: mapStatusToPropertyStatus(property.status as 'Actif' | 'Inactif') as PropertyStatus,
    type: (['APPARTEMENT', 'MAISON', 'VILLA', 'CHATEAU', 'PARKING', 'LOCAL_COMMERCIAL', 'BUREAU', 'ENTREPOT', 'TERRAIN', 'AUTRE'].includes(property.type || '')
      ? property.type
      : 'APPARTEMENT') as PropertyType,
    // Assurer que les champs obligatoires sont présents
    address: property.address || '',
    area: property.area || 0,
    rooms: property.rooms || 0,
    bathrooms: property.bathrooms || 0,
    furnished: property.furnished || false,
    rent: property.rent || 0,
    // Autres champs avec valeurs par défaut
    description: property.description || '',
    slug: (property as any).slug || '',
    createdAt: (property as any).createdAt || new Date().toISOString(),
    updatedAt: (property as any).updatedAt || new Date().toISOString(),
    publishedAt: (property as any).publishedAt || new Date().toISOString(),
    tags: (property as any).tags || []
  };
  
  selectedProperty.value = propertyData;
  showAddPropertyForm.value = true;
};

const deleteProperty = async (property: FormattedProperty) => {
  const propertyId = getPropertyId(property);
  if (propertyId === null) return;
  
  if (confirm(`Êtes-vous sûr de vouloir supprimer la propriété ${property.name || 'cette propriété'} ?`)) {
    try {
      await propertyStore.deleteProperty(propertyId);
      // Le store mettra à jour automatiquement la liste des propriétés
      selectedProperty.value = null;
    } catch (error) {
      console.error('Erreur lors de la suppression de la propriété:', error);
      alert('Une erreur est survenue lors de la suppression de la propriété');
    }
  }
};

const handleAddProperty = () => {
  showAddPropertyForm.value = true;
};

const handlePropertySubmit = async (propertyData: any) => {
  try {
    if (selectedProperty.value) {
      // Mise à jour d'une propriété existante
      let propertyId: number;
      
      if (typeof selectedProperty.value.id === 'string') {
        propertyId = parseInt(selectedProperty.value.id, 10);
      } else if (typeof selectedProperty.value.id === 'number') {
        propertyId = selectedProperty.value.id;
      } else {
        throw new Error('ID de propriété manquant ou invalide');
      }
      
      if (isNaN(propertyId)) {
        throw new Error('ID de propriété invalide');
      }
      
      await propertyStore.updateProperty(propertyId, propertyData);
    } else {
      // Création d'une nouvelle propriété
      await propertyStore.createProperty(propertyData);
    }
    
    // Fermer le formulaire
    showAddPropertyForm.value = false;
    
    // Mettre à jour la liste des propriétés
    await propertyStore.fetchProperties();
    
    // Afficher un message de succès
    alert(selectedProperty.value ? 'Propriété mise à jour avec succès !' : 'Propriété créée avec succès !');
    
    // Réinitialiser la propriété sélectionnée
    selectedProperty.value = null;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la propriété:', error);
    alert('Une erreur est survenue lors de la sauvegarde de la propriété');
  }
};

// Fonction pour signaler une propriété
const reportProperty = (property: FormattedProperty) => {
  console.log('Signalement de la propriété:', property);
  // Ici, vous pouvez ajouter la logique pour signaler la propriété
  // Par exemple, ouvrir un formulaire de signalement ou envoyer une requête API
  alert(`Signalement de la propriété: ${property.name || 'cette propriété'}`);
};

// Fonction pour ouvrir/fermer le menu d'une propriété
const openPropertyMenu = (property: FormattedProperty, event: MouseEvent) => {
  event.stopPropagation();
  const propertyId = getPropertyId(property);
  if (propertyId === null) return;
  
  propertyMenuOpen.value = propertyMenuOpen.value === propertyId ? null : propertyId;
};

// Gérer le clic en dehors du menu
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.property-actions')) {
    propertyMenuOpen.value = null;
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  
  // Fetch properties from API if needed
  // fetchProperties();
  
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
