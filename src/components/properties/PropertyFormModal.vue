<template>
  <div class="fixed inset-0 overflow-y-auto z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ property ? 'Modifier la propriété' : 'Ajouter une propriété' }}
                </h3>
                <button 
                  type="button" 
                  class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  @click="$emit('close')"
                >
                  <span class="sr-only">Fermer</span>
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
              <div class="mt-2">
                <BasePropertyForm
                  :property="property"
                  @submit="handleSubmit"
                  @cancel="$emit('close')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { PropType } from 'vue';
import type { Property } from '@/types/property';
import BasePropertyForm from './BasePropertyForm.vue';

const props = defineProps({
  property: {
    type: Object as PropType<Property | null>,
    default: null
  }
});

const emit = defineEmits(['save', 'close']);

const handleSubmit = (propertyData: Property) => {
  emit('save', propertyData);
  emit('close');
};
</script>
