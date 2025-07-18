<template>
  <div class="container mx-auto px-4 py-6">
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Chargement des détails...</p>
    </div>

    <div v-else-if="!property" class="text-center py-12">
      <p class="text-gray-500">Propriété non trouvée</p>
      <router-link to="/agent/properties" class="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
        <i class="fas fa-arrow-left mr-2"></i>
        Retour à la liste des propriétés
      </router-link>
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
      <!-- En-tête avec le titre et les actions -->
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            {{ property.title || 'Détails de la propriété' }}
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Référence: {{ property.id }}
          </p>
        </div>
        <div class="flex space-x-3">
          <router-link 
            v-if="property.id"
            :to="{ name: 'agent-edit-property', params: { id: property.id } }"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <i class="fas fa-edit mr-2"></i>
            Modifier
          </router-link>
          <button 
            @click="goBack"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            Retour
          </button>
        </div>
      </div>

      <div class="border-t border-gray-200">
        <dl>
          <!-- Galerie d'images -->
          <div v-if="property.images && property.images.length > 0" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">
              Galerie
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div class="grid grid-cols-3 gap-4">
                <div v-for="(image, index) in property.images" :key="index" class="aspect-w-16 aspect-h-9">
                  <img 
                    :src="typeof image === 'string' ? image : image.url" 
                    :alt="'Image ' + (index + 1)" 
                    class="object-cover rounded-lg h-40 w-full"
                  >
                </div>
              </div>
            </dd>
          </div>

          <!-- Informations de base -->
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">
              Informations de base
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-2">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="font-medium">Type:</span> {{ propertyTypeLabels[property.type] || 'Non spécifié' }}
                </div>
                <div>
                  <span class="font-medium">Statut:</span> 
                  <span :class="['px-2 py-1 text-xs rounded-full', getStatusBadgeClass(property.status)]">
                    {{ formatStatus(property.status) }}
                  </span>
                </div>
                <div v-if="property.area">
                  <span class="font-medium">Surface:</span> {{ property.area }} m²
                </div>
                <div v-if="property.rooms">
                  <span class="font-medium">Pièces:</span> {{ property.rooms }}
                </div>
                <div v-if="property.bedrooms">
                  <span class="font-medium">Chambres:</span> {{ property.bedrooms }}
                </div>
                <div v-if="property.bathrooms">
                  <span class="font-medium">Salles de bain:</span> {{ property.bathrooms }}
                </div>
              </div>
            </dd>
          </div>

          <!-- Adresse -->
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">
              Adresse
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div v-if="property.address">
                <p class="font-medium">
                  {{ typeof property.address === 'string' ? property.address : (property.address.street || 'Adresse non spécifiée') }}
                </p>
                <p v-if="typeof property.address !== 'string'">{{ formatAddress(property.address) }}</p>
              </div>
              <p v-else class="text-gray-500">Aucune adresse renseignée</p>
            </dd>
          </div>

          <!-- Détails financiers -->
          <div v-if="property.rent || property.charges || property.deposit" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">
              Détails financiers
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-2">
              <div v-if="property.rent" class="grid grid-cols-2 gap-4">
                <div>
                  <span class="font-medium">Loyer:</span> 
                  {{ formatCurrency(property.rent, property.currency) }} / mois
                </div>
                <div v-if="property.charges">
                  <span class="font-medium">Charges:</span> {{ formatCurrency(property.charges, property.currency) }}
                </div>
                <div v-if="property.deposit">
                  <span class="font-medium">Dépôt de garantie:</span> {{ formatCurrency(property.deposit, property.currency) }}
                </div>
              </div>
            </dd>
          </div>

          <!-- Description -->
          <div v-if="property.description" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">
              Description
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
              {{ property.description }}
            </dd>
          </div>

          <!-- Équipements -->
          <div v-if="property.equipment && (Array.isArray(property.equipment) ? property.equipment.length > 0 : property.equipment)" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">
              Équipements
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div class="grid grid-cols-2 gap-2">
                <template v-if="Array.isArray(property.equipment)">
                  <div v-for="(equipment, index) in property.equipment" :key="index" class="flex items-center">
                    <i class="fas fa-check text-green-500 mr-2"></i>
                    <span>{{ equipment }}</span>
                  </div>
                </template>
                <div v-else class="flex items-center">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>{{ property.equipment }}</span>
                </div>
              </div>
            </dd>
          </div>

          <!-- Informations du propriétaire -->
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">
              Propriétaire
            </dt>
            <dd v-if="property.ownerId || property.landlord" class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-2">
              <div v-if="property.ownerId">
                <span class="font-medium">Référence:</span> 
                {{ property.ownerId }}
              </div>
              <div v-if="property.landlord">
                <span class="font-medium">Nom:</span> 
                {{ [property.landlord.firstName, property.landlord.lastName].filter(Boolean).join(' ') || 'Non spécifié' }}
              </div>
              <div v-if="property.landlord?.email">
                <span class="font-medium">Email:</span> {{ property.landlord.email }}
              </div>
              <div v-if="property.landlord?.phone">
                <span class="font-medium">Téléphone:</span> {{ property.landlord.phone }}
              </div>
            </dd>
            <dd v-else class="mt-1 text-sm text-gray-500 sm:mt-0 sm:col-span-2">
              Aucun propriétaire associé
            </dd>
          </div>

          <!-- Informations du locataire -->
          <div v-if="property.tenantId" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">
              Locataire actuel
            </dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-2">
              <div>
                <span class="font-medium">Référence:</span> 
                {{ property.tenantId }}
              </div>
              <div v-if="property.tenant">
                <span class="font-medium">Nom:</span> 
                {{ [property.tenant.firstName, property.tenant.lastName].filter(Boolean).join(' ') || 'Non spécifié' }}
              </div>
              <div v-if="property.tenant?.email">
                <span class="font-medium">Email:</span> {{ property.tenant.email }}
              </div>
              <div v-if="property.tenant?.phone">
                <span class="font-medium">Téléphone:</span> {{ property.tenant.phone }}
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePropertyStore } from '@/stores/propertyStore';
import { Property, propertyTypeLabels } from '@/types/property';

interface Address {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  [key: string]: any;
}

interface User {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface PropertyWithRelations extends Omit<Property, 'address'> {
  address: Property['address'] | string; // Peut être un objet PropertyAddress ou une chaîne
  landlord?: User;
  tenant?: User;
}

const route = useRoute();
const router = useRouter();
const propertyStore = usePropertyStore();

const property = ref<PropertyWithRelations | null>(null);
const isLoading = ref(true);

// Récupérer les détails de la propriété
const fetchProperty = async () => {
  try {
    const propertyId = route.params.id as string;
    if (!propertyId) {
      console.error('Aucun ID de propriété fourni');
      return;
    }
    
    // Ici, vous devrez implémenter la récupération des détails de la propriété
    // depuis votre store ou API
    const response = await propertyStore.fetchPropertyById(propertyId);
    if (response) {
      property.value = response as PropertyWithRelations;
    } else {
      console.error('Propriété non trouvée');
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la propriété:', error);
  } finally {
    isLoading.value = false;
  }
};

// Fonction pour formater l'adresse
const formatAddress = (address: string | Address): string => {
  if (!address) return 'Aucune adresse renseignée';
  if (typeof address === 'string') return address;
  return `${address.street || ''}, ${address.postalCode || ''} ${address.city || ''}, ${address.country || ''}`
    .replace(/\s*,\s*,/g, ',')
    .replace(/^\s*,\s*|\s*,\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Formater la devise
const formatCurrency = (amount: number, currencyCode: string = 'EUR') => {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currencyCode || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  } catch (error) {
    console.error('Erreur de formatage de la devise:', error);
    return `${amount || 0} ${currencyCode || 'EUR'}`;
  }
};

// Formater le statut
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'DISPONIBLE': 'Disponible',
    'LOUE': 'Loué',
    'EN_MAINTENANCE': 'En maintenance',
    'INDISPONIBLE': 'Indisponible',
    'RESERVE': 'Réservé',
    'EN_NEGOCIATION': 'En négociation'
  };
  return statusMap[status] || status;
};

// Classe CSS pour le badge de statut
const getStatusBadgeClass = (status: string) => {
  const statusClasses: Record<string, string> = {
    'DISPONIBLE': 'bg-green-100 text-green-800',
    'LOUE': 'bg-blue-100 text-blue-800',
    'EN_MAINTENANCE': 'bg-yellow-100 text-yellow-800',
    'INDISPONIBLE': 'bg-red-100 text-red-800',
    'RESERVE': 'bg-purple-100 text-purple-800',
    'EN_NEGOCIATION': 'bg-orange-100 text-orange-800'
  };
  return statusClasses[status] || 'bg-gray-100 text-gray-800';
};

// Navigation arrière
const goBack = () => {
  router.go(-1);
};

// Charger les données au montage du composant
onMounted(() => {
  fetchProperty();
});
</script>
