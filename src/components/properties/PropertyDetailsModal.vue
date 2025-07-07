<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <div class="flex justify-between items-center">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Détails du bien
                </h3>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
                  <span class="sr-only">Fermer</span>
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div class="mt-4 space-y-4">
                <!-- Property Images -->
                <div v-if="property.images && property.images.length > 0" class="relative h-64 rounded-lg overflow-hidden">
                  <img :src="getImageUrl(property.images[0])" :alt="property.title" class="w-full h-full object-cover">
                </div>
                
                <!-- Property Details -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 class="font-medium text-gray-700">Adresse</h4>
                    <p class="text-gray-900">{{ getAddressField('street') }}</p>
                    <p class="text-gray-900">{{ getAddressField('postal_code') }} {{ getAddressField('city') }}</p>
                    <p class="text-gray-900">{{ getAddressField('country') }}</p>
                  </div>
                  
                  <div>
                    <h4 class="font-medium text-gray-700">Informations</h4>
                    <p class="text-gray-900">Type: {{ propertyTypeDisplay }}</p>
                    <p class="text-gray-900">Surface: {{ property.area }} m²</p>
                    <p class="text-gray-900">Pièces: {{ property.rooms }}</p>
                    <p class="text-gray-900" v-if="property.bedrooms">Chambres: {{ property.bedrooms }}</p>
                    <p class="text-gray-900">Salles de bain: {{ property.bathrooms || 0 }}</p>
                    <p class="text-gray-900">Loyer: {{ property.rent }} €/mois</p>
                    <p class="text-gray-900">Charges: {{ property.charges || 0 }} €/mois</p>
                  </div>
                </div>
                
                <!-- Description -->
                <div v-if="property.description">
                  <h4 class="font-medium text-gray-700">Description</h4>
                  <p class="text-gray-900 whitespace-pre-line">{{ property.description }}</p>
                </div>
                
                <!-- Equipment -->
                <div v-if="property.equipment && property.equipment.length > 0">
                  <h4 class="font-medium text-gray-700">Équipements</h4>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span v-for="(item, index) in property.equipment" :key="index" 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ item }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer with action buttons -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" 
                  @click="$emit('close')" 
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import type { Property, PropertyImage } from '@/types/property';
import { propertyTypeLabels as propertyTypeLabelsMap } from '@/types/property';

const props = defineProps<{
  property: Property;
}>();

const emit = defineEmits(['close']);

const getImageUrl = (image: PropertyImage | string): string => {
  return typeof image === 'string' ? image : image.url;
};

const getAddressField = (field: string): string => {
  if (!props.property.address) return '';
  
  if (typeof props.property.address === 'string') {
    // If address is a string, return it for all fields
    return props.property.address;
  } else {
    // If address is a PropertyAddress object
    const value = props.property.address[field as keyof typeof props.property.address];
    return value !== undefined && value !== null ? String(value) : '';
  }
};

// Convert property type to display text
const getPropertyTypeLabel = (type: string | number | undefined): string => {
  if (type === undefined || type === null) return 'Non spécifié';
  const typeStr = typeof type === 'number' ? type.toString() : type;
  return propertyTypeLabelsMap[typeStr as keyof typeof propertyTypeLabelsMap] || typeStr;
};

// Get property type display text
const propertyTypeDisplay = computed(() => {
  return getPropertyTypeLabel(props.property?.type);
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
