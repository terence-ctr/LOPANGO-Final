<template>
  <BasePropertyForm
    :initial-data="initialData"
    :is-editing="isEditing"
    :submit-button-text="submitButtonText"
    :show-rent-field="true"
    @submit="handleSubmit"
    @cancel="$emit('cancel')"
  >
    <!-- Champs spécifiques aux locataires -->
    <div class="space-y-6">
      <h3 class="text-lg font-medium text-gray-900">Informations pour les locataires</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Date d'entrée -->
        <div class="space-y-2">
          <label for="entryDate" class="block text-sm font-medium text-gray-700">
            Date d'entrée
          </label>
          <input
            id="entryDate"
            v-model="formData.entryDate"
            type="date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <!-- Durée du bail -->
        <div class="space-y-2">
          <label for="leaseDuration" class="block text-sm font-medium text-gray-700">
            Durée du bail (mois)
          </label>
          <input
            id="leaseDuration"
            v-model.number="formData.leaseDuration"
            type="number"
            min="1"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="12"
          />
        </div>
      </div>

      <!-- Notes personnelles -->
      <div class="space-y-2">
        <label for="tenantNotes" class="block text-sm font-medium text-gray-700">
          Notes personnelles
        </label>
        <textarea
          id="tenantNotes"
          v-model="formData.tenantNotes"
          rows="2"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Notes personnelles sur le logement..."
        ></textarea>
      </div>
    </div>
  </BasePropertyForm>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import BasePropertyForm from '@/components/shared/properties/BasePropertyForm.vue';

const props = defineProps({
  property: {
    type: Object,
    default: () => ({
      name: '',
      type: '',
      status: 'Disponible',
      address: {
        street: '',
        postalCode: '',
        city: ''
      },
      surface: null,
      rooms: 1,
      floor: null,
      rent: null,
      entryDate: '',
      leaseDuration: 12,
      tenantNotes: '',
      equipments: []
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  submitButtonText: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['submit', 'cancel']);

// Données par défaut pour éviter les erreurs
const defaultProperty = {
  name: '',
  type: '',
  status: 'Disponible',
  address: {
    street: '',
    postalCode: '',
    city: ''
  },
  surface: null,
  rooms: 1,
  floor: null,
  rent: null,
  entryDate: '',
  leaseDuration: 12,
  tenantNotes: '',
  equipments: []
};

// Gestion des données du formulaire
const formData = ref({
  ...defaultProperty,
  ...(props.property || {})
});

// S'assurer que les équipements sont un tableau
if (!Array.isArray(formData.value.equipments)) {
  formData.value.equipments = [];
}

// Mettre à jour formData lorsque la propriété change
watch(() => props.property, (newVal) => {
  formData.value = {
    ...defaultProperty,
    ...(newVal || {}),
    equipments: Array.isArray(newVal?.equipments) ? [...newVal.equipments] : []
  };
}, { deep: true, immediate: true });

// Préparer les données initiales pour le formulaire de base
const initialData = computed(() => ({
  ...formData.value,
  equipments: Array.isArray(formData.value.equipments) 
    ? [...formData.value.equipments] 
    : []
}));

const handleSubmit = (formData) => {
  // Vous pouvez ajouter ici une logique spécifique aux locataires si nécessaire
  emit('submit', formData);
};
</script>
