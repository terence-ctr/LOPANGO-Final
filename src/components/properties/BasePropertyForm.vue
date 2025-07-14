<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Basic Information -->
    <div class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Titre</label>
        <input
          type="text"
          id="title"
          v-model="form.title"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="type" class="block text-sm font-medium text-gray-700">Type de bien</label>
        <select
          id="type"
          v-model="form.type"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Sélectionnez un type</option>
          <option v-for="type in propertyTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        ></textarea>
      </div>
    </div>

    <!-- Location -->
    <div class="space-y-4">
      <div>
        <label for="street" class="block text-sm font-medium text-gray-700">Rue</label>
        <input
          type="text"
          id="street"
          v-model="form.address.street"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700">Ville</label>
          <input
            type="text"
            id="city"
            v-model="form.address.city"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="postal_code" class="block text-sm font-medium text-gray-700">Code Postal</label>
          <input
            type="text"
            id="postal_code"
            v-model="form.address.postal_code"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="country" class="block text-sm font-medium text-gray-700">Pays</label>
          <select
            id="country"
            v-model="form.address.country"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Sélectionnez un pays</option>
            <option value="FR">France</option>
            <option value="BE">Belgique</option>
            <option value="CH">Suisse</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Characteristics -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="area" class="block text-sm font-medium text-gray-700">Surface (m²)</label>
          <input
            type="number"
            id="area"
            v-model="form.area"
            required
            min="0"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="rooms" class="block text-sm font-medium text-gray-700">Nombre de pièces</label>
          <input
            type="number"
            id="rooms"
            v-model="form.rooms"
            required
            min="0"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="bathrooms" class="block text-sm font-medium text-gray-700">Nombre de salles de bain</label>
          <input
            type="number"
            id="bathrooms"
            v-model="form.bathrooms"
            required
            min="0"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="floor" class="block text-sm font-medium text-gray-700">Étage</label>
          <input
            type="number"
            id="floor"
            v-model="form.floor"
            min="0"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="year_built" class="block text-sm font-medium text-gray-700">Année de construction</label>
          <input
            type="number"
            id="year_built"
            v-model="form.year_built"
            min="1900"
            max="2099"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Price -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="rent" class="block text-sm font-medium text-gray-700">Loyer mensuel (€)</label>
          <input
            type="number"
            id="rent"
            v-model="form.rent"
            required
            min="0"
            step="0.01"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="charges" class="block text-sm font-medium text-gray-700">Charges mensuelles (€)</label>
          <input
            type="number"
            id="charges"
            v-model="form.charges"
            min="0"
            step="0.01"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div class="col-span-2">
          <label for="deposit" class="block text-sm font-medium text-gray-700">Dépôt de garantie (€)</label>
          <input
            type="number"
            id="deposit"
            v-model="form.deposit"
            required
            min="0"
            step="0.01"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Amenities -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="amenity in amenities" :key="amenity.id">
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              :id="amenity.id"
              v-model="form[amenity.id]"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">{{ amenity.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        type="submit"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from 'vue';
import type { Property } from '@/types/property';

interface PropertyFormData {
  title: string;
  type: string;
  description: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  area: number;
  rooms: number;
  bathrooms: number;
  floor: number;
  year_built: number;
  rent: number;
  charges: number;
  deposit: number;
  furnished: boolean;
  has_air_conditioning: boolean;
  has_balcony: boolean;
  has_elevator: boolean;
  has_garden: boolean;
  has_heating: boolean;
  has_parking: boolean;
  has_pool: boolean;
  has_terrace: boolean;
}

const propertyTypes = [
  { value: 'APPARTEMENT', label: 'Appartement' },
  { value: 'MAISON', label: 'Maison' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'CHATEAU', label: 'Château' },
  { value: 'PARKING', label: 'Parking' },
  { value: 'LOCAL_COMMERCIAL', label: 'Local commercial' },
  { value: 'BUREAU', label: 'Bureau' },
  { value: 'ENTREPOT', label: 'Entrepôt' },
  { value: 'TERRAIN', label: 'Terrain' },
  { value: 'AUTRE', label: 'Autre type de bien' }
];

const amenities = [
  { id: 'furnished', label: 'Meublé' },
  { id: 'has_air_conditioning', label: 'Climatisation' },
  { id: 'has_balcony', label: 'Balcon' },
  { id: 'has_elevator', label: 'Ascenseur' },
  { id: 'has_garden', label: 'Jardin' },
  { id: 'has_heating', label: 'Chauffage' },
  { id: 'has_parking', label: 'Parking' },
  { id: 'has_pool', label: 'Piscine' },
  { id: 'has_terrace', label: 'Terrasse' }
];

const props = defineProps({
  property: {
    type: Object as PropType<Property>,
    default: null
  },
  submitLabel: {
    type: String,
    default: 'Enregistrer'
  }
});

const emit = defineEmits(['submit']);

const form = ref<PropertyFormData>({
  title: '',
  type: '',
  description: '',
  address: {
    street: '',
    city: '',
    postal_code: '',
    country: ''
  },
  area: 0,
  rooms: 0,
  bathrooms: 0,
  floor: 0,
  year_built: 0,
  rent: 0,
  charges: 0,
  deposit: 0,
  furnished: false,
  has_air_conditioning: false,
  has_balcony: false,
  has_elevator: false,
  has_garden: false,
  has_heating: false,
  has_parking: false,
  has_pool: false,
  has_terrace: false
});

// Initialize form with property data if editing
if (props.property) {
  Object.assign(form.value, {
    ...props.property,
    address: props.property.address || {
      street: '',
      city: '',
      postal_code: '',
      country: ''
    }
  });
}

const handleSubmit = () => {
  emit('submit', form.value);
};
</script>
