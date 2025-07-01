<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <!-- En-tête du formulaire -->
      <div class="border-b border-gray-200 pb-5">
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          {{ isEditing ? 'Modifier le bien' : 'Ajouter un nouveau bien' }}
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          Remplissez les détails du bien immobilier
        </p>
      </div>

      <!-- Champs de base -->
      <div class="space-y-6">
        <!-- Nom du bien -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">
            Nom du bien <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Ex: Appartement T3 centre-ville"
          />
        </div>

        <!-- Type de bien -->
        <div>
          <label for="type" class="block text-sm font-medium text-gray-700">
            Type de bien <span class="text-red-500">*</span>
          </label>
          <select
            id="type"
            v-model="formData.type"
            required
            class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Sélectionnez un type</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="MAISON">Maison</option>
            <option value="STUDIO">Studio</option>
            <option value="T1">T1</option>
            <option value="T2">T2</option>
            <option value="T3">T3</option>
            <option value="T4">T4+</option>
          </select>
        </div>

        <!-- Adresse -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div class="md:col-span-2">
            <label for="street" class="block text-sm font-medium text-gray-700">
              Adresse <span class="text-red-500">*</span>
            </label>
            <input
              id="street"
              v-model="formData.address.street"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="N° et nom de la rue"
            />
          </div>
          <div>
            <label for="postalCode" class="block text-sm font-medium text-gray-700">
              Code postal <span class="text-red-500">*</span>
            </label>
            <input
              id="postal_code"
              v-model="formData.address.postal_code"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="75000"
            />
          </div>
          <div class="md:col-span-2">
            <label for="city" class="block text-sm font-medium text-gray-700">
              Ville <span class="text-red-500">*</span>
            </label>
            <input
              id="city"
              v-model="formData.address.city"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ville"
            />
          </div>
          <div class="md:col-span-1">
            <label for="country" class="block text-sm font-medium text-gray-700">
              Pays <span class="text-red-500">*</span>
            </label>
            <input
              id="country"
              v-model="formData.address.country"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Pays"
            />
          </div>
        </div>

        <!-- Surface et pièces -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label for="surface" class="block text-sm font-medium text-gray-700">
              Surface (m²) <span class="text-red-500">*</span>
            </label>
            <input
              id="surface"
              v-model.number="formData.surface"
              type="number"
              min="1"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ex: 45"
            />
          </div>
          <div>
            <label for="rooms" class="block text-sm font-medium text-gray-700">
              Nombre de pièces <span class="text-red-500">*</span>
            </label>
            <input
              id="rooms"
              v-model.number="formData.rooms"
              type="number"
              min="1"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ex: 2"
            />
          </div>
          <div>
            <label for="floor" class="block text-sm font-medium text-gray-700">
              Étage
            </label>
            <input
              id="floor"
              v-model.number="formData.floor"
              type="number"
              min="0"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ex: 2 (optionnel)"
            />
          </div>
        </div>

        <!-- Loyer et charges -->
        <div v-if="showRentField" class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label for="rent" class="block text-sm font-medium text-gray-700">
              Loyer (€) <span class="text-red-500">*</span>
            </label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <span class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                €
              </span>
              <input
                id="rent"
                v-model.number="formData.rent"
                type="number"
                min="0"
                step="0.01"
                required
                class="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label for="charges" class="block text-sm font-medium text-gray-700">
              Charges (€)
            </label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <span class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                €
              </span>
              <input
                id="charges"
                v-model.number="formData.charges"
                type="number"
                min="0"
                step="0.01"
                class="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="0.00 (optionnel)"
              />
            </div>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div class="mt-1">
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Description détaillée du bien..."
            />
          </div>
        </div>

        <!-- Équipements -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Équipements
          </label>
          <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div v-for="equipment in equipmentOptions" :key="equipment.value" class="flex items-start">
              <div class="flex h-5 items-center">
                <input
                  :id="`equipment-${equipment.value}`"
                  v-model="formData.equipments"
                  type="checkbox"
                  :value="equipment.value"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label :for="`equipment-${equipment.value}`" class="font-medium text-gray-700">
                  {{ equipment.label }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Emplacement des slots pour le contenu personnalisé -->
        <slot></slot>

        <!-- Boutons d'action -->
        <div class="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @click="handleCancel"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {{ submitButtonText || (isEditing ? 'Mettre à jour' : 'Créer') }}
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      name: '',
      type: '',
      description: '',
      address: {
        street: '',
        city: '',
        postal_code: '',
        country: 'congo'  // Valeur par défaut
      },
      surface: null,
      rooms: 1,
      floor: null,
      rent: null,
      charges: null,
      equipments: [],
      status: 'DISPONIBLE'
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  submitButtonText: {
    type: String,
    default: ''
  },
  showRentField: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['submit', 'cancel']);

// Données du formulaire
const formData = ref({
  name: '',
  type: '',
  description: '',
  address: {
    street: '',
    city: '',
    postal_code: '',
    country: 'congo'  // Valeur par défaut
  },
  surface: null,
  rooms: 1,
  floor: null,
  rent: null,
  charges: null,
  equipments: [],
  status: 'DISPONIBLE'
});

// Options pour les équipements
const equipmentOptions = [
  { value: 'elevator', label: 'Ascenseur' },
  { value: 'parking', label: 'Parking' },
  { value: 'balcony', label: 'Balcon' },
  { value: 'terrace', label: 'Terrasse' },
  { value: 'garden', label: 'Jardin' },
  { value: 'furnished', label: 'Meublé' },
  { value: 'fireplace', label: 'Cheminée' },
  { value: 'intercom', label: 'Interphone' },
  { value: 'digicode', label: 'Digicode' },
  { value: 'caretaker', label: 'Garde' },
  { value: 'cellar', label: 'Cave' },
  { value: 'airConditioning', label: 'Climatisation' },
  { value: 'doubleGlazing', label: 'Double vitrage' },
  { value: 'swimmingPool', label: 'Piscine' },
  { value: 'alarm', label: 'Alarme' }
];

// Mettre à jour le formulaire quand les données initiales changent
watch(() => props.initialData, (newValue) => {
  if (newValue) {
    formData.value = JSON.parse(JSON.stringify(newValue));
  }
}, { immediate: true, deep: true });

// Gestion de la soumission du formulaire
const handleSubmit = () => {
  // Émettre les données du formulaire
  emit('submit', formData.value);
};

// Gestion de l'annulation
const handleCancel = () => {
  emit('cancel');
};
</script>
