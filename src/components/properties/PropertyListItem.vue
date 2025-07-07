<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-lg leading-7 font-medium text-gray-900 truncate">
            {{ property.title }}
          </h2>
          <div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div class="mt-2 flex items-center text-sm text-gray-500">
              <i class="fas fa-map-marker-alt mr-1.5 text-gray-400"></i>
              {{ formatAddress(property) }}
            </div>
            <div class="mt-2 flex items-center text-sm text-gray-500">
              <i class="fas fa-ruler-combined mr-1.5 text-gray-400"></i>
              {{ property.area || 'N/A' }} m²
            </div>
            <div class="mt-2 flex items-center text-sm text-gray-500">
              <i class="fas fa-bed mr-1.5 text-gray-400"></i>
              {{ property.bedrooms || 'N/A' }} chambres
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-xl font-bold text-blue-600">
            {{ formatCurrency(property.rent) }}
            <span class="text-sm font-normal text-gray-500">/mois</span>
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusClasses(property.status)">
            {{ getStatusLabel(property.status) }}
          </span>
          <div class="flex items-center space-x-2">
            <button 
              @click.stop="$emit('toggle-favorite', property)" 
              class="p-1 text-gray-400 hover:text-red-500"
              :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
            >
              <i 
                class="fas fa-heart" 
                :class="{ 'text-red-500': isFavorite }"
              ></i>
            </button>
            <button 
              @click="$emit('view-details', property)" 
              class="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voir les détails
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { Property } from '@/types/property';

const props = defineProps({
  property: {
    type: Object as PropType<Property>,
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-favorite', 'view-details']);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(value);
};

const formatAddress = (property: Property) => {
  const parts = [];
  if (property.address) {
    if (typeof property.address === 'string') {
      return property.address;
    }
    if (property.address.street) parts.push(property.address.street);
    if (property.address.postal_code) parts.push(property.address.postal_code);
    if (property.address.city) parts.push(property.address.city);
  }
  return parts.length > 0 ? parts.join(', ') : 'Adresse non disponible';
};

const getStatusClasses = (status: string) => {
  return {
    'bg-green-100 text-green-800': status === 'available' || status === 'actif',
    'bg-red-100 text-red-800': status === 'rented' || status === 'loué',
    'bg-yellow-100 text-yellow-800': status === 'maintenance' || status === 'en_maintenance',
    'bg-blue-100 text-blue-800': !['available', 'rented', 'maintenance', 'actif', 'loué', 'en_maintenance'].includes(status)
  };
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'available': 'Disponible',
    'actif': 'Disponible',
    'rented': 'Loué',
    'loué': 'Loué',
    'maintenance': 'En maintenance',
    'en_maintenance': 'En maintenance',
    'inactive': 'Inactif',
    'inactif': 'Inactif'
  };
  return statusMap[status] || status;
};
</script>
