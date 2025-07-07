<template>
  <div class="property-card bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
    <!-- En-tête avec image -->
    <div class="h-48 bg-gray-200 relative">
      <img 
        :src="getImageUrl(property.images?.[0])" 
        :alt="property.title || 'Image du bien'"
        class="w-full h-full object-cover"
        @error="handleImageError"
      >
      <div class="absolute top-2 right-2">
        <button 
          @click.stop="$emit('toggle-favorite', property)" 
          class="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
          :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
        >
          <i 
            class="fas fa-heart text-lg" 
            :class="{ 'text-red-500': isFavorite, 'text-gray-400': !isFavorite }"
          ></i>
        </button>
      </div>
      <div class="absolute bottom-2 left-2">
        <span 
          class="px-2 py-1 text-xs font-semibold rounded-full"
          :class="getStatusClasses(property.status)"
        >
          {{ getStatusLabel(property.status) }}
        </span>
      </div>
    </div>
    
    <!-- Corps de la carte -->
    <div class="p-4 flex-1 flex flex-col">
      <div class="flex justify-between items-start">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ property.title || 'Sans titre' }}</h3>
        <span class="text-lg font-bold text-blue-600">
          {{ formatCurrency(property.rent) }}<span class="text-sm font-normal text-gray-500">/mois</span>
        </span>
      </div>
      
      <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ property.description || 'Aucune description disponible' }}</p>
      
      <div class="mt-auto pt-3 border-t border-gray-100">
        <div class="flex items-center text-sm text-gray-500 mb-2">
          <i class="fas fa-map-marker-alt mr-2"></i>
          <span class="truncate">{{ formatAddress(property) }}</span>
        </div>
        
        <div class="flex justify-between items-center">
          <div class="flex space-x-2">
            <span class="text-xs text-gray-500">
              <i class="fas fa-ruler-combined mr-1"></i> {{ property.area || 'N/A' }} m²
            </span>
            <span class="text-xs text-gray-500">
              <i class="fas fa-bed mr-1"></i> {{ property.bedrooms || property.rooms || 'N/A' }}
            </span>
            <span class="text-xs text-gray-500">
              <i class="fas fa-bath mr-1"></i> {{ property.bathrooms || 'N/A' }}
            </span>
          </div>
          
          <button 
            @click="$emit('view-details', property)" 
            class="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
          >
            Voir plus <i class="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { Property, PropertyImage, PropertyStatus } from '@/types/property';

const props = defineProps({
  property: {
    type: Object as PropType<Property>,
    required: true,
    default: () => ({
      id: '',
      title: '',
      type: 'APPARTEMENT',
      status: 'DISPONIBLE',
      rent: 0,
      area: 0,
      rooms: 0,
      bedrooms: 0,
      bathrooms: 0,
      address: { street: '', city: '', postal_code: '', country: '' },
      description: ''
    })
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  (e: 'toggle-favorite', property: Property): void;
  (e: 'view-details', property: Property): void;
}>();

const getImageUrl = (image: string | PropertyImage | undefined): string => {
  if (!image) return 'https://via.placeholder.com/400x300?text=Image+non+disponible';
  if (typeof image === 'string') return image;
  return image.url || 'https://via.placeholder.com/400x300?text=Image+non+disponible';
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(value);
};

const formatAddress = (property: Property) => {
  if (!property.address) return 'Adresse non disponible';
  
  if (typeof property.address === 'string') {
    return property.address;
  }
  
  const parts = [];
  if (property.address.street) parts.push(property.address.street);
  if (property.address.postal_code) parts.push(property.address.postal_code);
  if (property.address.city) parts.push(property.address.city);
  
  return parts.length > 0 ? parts.join(', ') : 'Adresse non disponible';
};

const getStatusClasses = (status: PropertyStatus | string) => {
  const statusMap: Record<string, string> = {
    'DISPONIBLE': 'bg-green-100 text-green-800',
    'LOUE': 'bg-blue-100 text-blue-800',
    'EN_MAINTENANCE': 'bg-yellow-100 text-yellow-800',
    'EN_ENTRETIEN': 'bg-yellow-100 text-yellow-800',
    'VENDU': 'bg-purple-100 text-purple-800',
    'INDISPONIBLE': 'bg-red-100 text-red-800',
    'RESERVE': 'bg-orange-100 text-orange-800',
    'EN_NEGOCIATION': 'bg-indigo-100 text-indigo-800'
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: PropertyStatus | string) => {
  const statusMap: Record<string, string> = {
    'DISPONIBLE': 'Disponible',
    'LOUE': 'Loué',
    'EN_MAINTENANCE': 'En maintenance',
    'EN_ENTRETIEN': 'En entretien',
    'VENDU': 'Vendu',
    'INDISPONIBLE': 'Indisponible',
    'RESERVE': 'Réservé',
    'EN_NEGOCIATION': 'En négociation'
  };
  
  return statusMap[status] || status;
};
</script>
