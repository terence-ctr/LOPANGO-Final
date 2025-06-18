<template>
  <form @submit.prevent="submitForm" class="space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Section Informations de base -->
    <div class="bg-white shadow-sm rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-6">Informations de base</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Titre -->
        <div class="md:col-span-2">
          <label for="title" class="block text-sm font-medium text-gray-700">Titre de l'annonce</label>
          <input
            id="title"
            v-model="propertyData.title"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>

        <!-- Description -->
        <div class="md:col-span-2">
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            v-model="propertyData.description"
            rows="3"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        <!-- Type de bien -->
        <div>
          <label for="type" class="block text-sm font-medium text-gray-700">Type de bien</label>
          <select
            id="type"
            v-model="propertyData.type"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option 
              v-for="[value, label] in Object.entries(propertyTypeLabels)" 
              :key="value" 
              :value="value as PropertyType"
            >
              {{ label }}
            </option>
          </select>
        </div>

        <!-- Statut -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Statut</label>
          <select
            id="status"
            v-model="propertyData.status"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option 
              v-for="[value, label] in Object.entries(propertyStatusLabels)" 
              :key="value" 
              :value="value as PropertyStatus"
            >
              {{ label }}
            </option>
          </select>
        </div>

        <!-- Superficie -->
        <div>
          <label for="area" class="block text-sm font-medium text-gray-700">Superficie (m²)</label>
          <input
            id="area"
            v-model.number="propertyData.area"
            type="number"
            min="1"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>

        <!-- Surface habitable -->
        <div>
          <label for="floorArea" class="block text-sm font-medium text-gray-700">Surface habitable (m²)</label>
          <input
            id="floorArea"
            v-model.number="propertyData.floorArea"
            type="number"
            min="1"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>
      </div>
    </div>

    <!-- Section Adresse -->
    <div class="bg-white shadow-sm rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-6">Adresse</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Rue -->
        <div class="md:col-span-2">
          <label for="street" class="block text-sm font-medium text-gray-700">Adresse</label>
          <input
            id="street"
            v-model="propertyData.street"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>

        <!-- Code postal -->
        <div>
          <label for="postalCode" class="block text-sm font-medium text-gray-700">Code postal</label>
          <input
            id="postalCode"
            v-model="propertyData.postalCode"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>

        <!-- Ville -->
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700">Ville</label>
          <input
            id="city"
            v-model="propertyData.city"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>


        <!-- Pays -->
        <div>
          <label for="country" class="block text-sm font-medium text-gray-700">Pays</label>
          <input
            id="country"
            v-model="propertyData.country"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>

        <!-- Adresse complète -->
        <div class="md:col-span-2">
          <label for="fullAddress" class="block text-sm font-medium text-gray-700">Adresse complète</label>
          <input
            id="fullAddress"
            v-model="propertyData.fullAddress"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>


        <!-- Coordonnées GPS -->
        <div>
          <label for="latitude" class="block text-sm font-medium text-gray-700">Latitude</label>
          <input
            id="latitude"
            v-model.number="propertyData.latitude"
            type="number"
            step="0.000001"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>
        <div>
          <label for="longitude" class="block text-sm font-medium text-gray-700">Longitude</label>
          <input
            id="longitude"
            v-model.number="propertyData.longitude"
            type="number"
            step="0.000001"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>
      </div>
    </div>

    <!-- Section Caractéristiques supplémentaires -->
    <div class="bg-white shadow-sm rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-6">Caractéristiques supplémentaires</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Ascenseur -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="hasElevator"
              v-model="propertyData.hasElevator"
              type="checkbox"
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="hasElevator" class="font-medium text-gray-700">Ascenseur</label>
          </div>
        </div>

        <!-- Parking -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="hasParking"
              v-model="propertyData.hasParking"
              type="checkbox"
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="hasParking" class="font-medium text-gray-700">Parking</label>
          </div>
        </div>

        <!-- Balcon -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="hasBalcony"
              v-model="propertyData.hasBalcony"
              type="checkbox"
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="hasBalcony" class="font-medium text-gray-700">Balcon</label>
          </div>
        </div>

        <!-- Terrasse -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="hasTerrace"
              v-model="propertyData.hasTerrace"
              type="checkbox"
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="hasTerrace" class="font-medium text-gray-700">Terrasse</label>
          </div>
        </div>

        <!-- Jardin -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="hasGarden"
              v-model="propertyData.hasGarden"
              type="checkbox"
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="hasGarden" class="font-medium text-gray-700">Jardin</label>
          </div>
        </div>

        <!-- Piscine -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="hasPool"
              v-model="propertyData.hasPool"
              type="checkbox"
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="hasPool" class="font-medium text-gray-700">Piscine</label>
          </div>
        </div>

        <!-- Climatisation -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="hasAirConditioning"
              v-model="propertyData.hasAirConditioning"
              type="checkbox"
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="hasAirConditioning" class="font-medium text-gray-700">Climatisation</label>
          </div>
        </div>

        <!-- Chauffage -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="hasHeating"
              v-model="propertyData.hasHeating"
              type="checkbox"
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="hasHeating" class="font-medium text-gray-700">Chauffage</label>
          </div>
        </div>


        <!-- Année de construction -->
        <div class="md:col-span-2">
          <label for="yearBuilt" class="block text-sm font-medium text-gray-700">Année de construction</label>
          <input
            id="yearBuilt"
            v-model.number="propertyData.yearBuilt"
            type="number"
            min="1800"
            :max="new Date().getFullYear()"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>

        <!-- Surface du terrain -->
        <div>
          <label for="landArea" class="block text-sm font-medium text-gray-700">Surface du terrain (m²)</label>
          <input
            id="landArea"
            v-model.number="propertyData.landArea"
            type="number"
            min="0"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <!-- Nombre de pièces -->
        <div>
          <label for="rooms" class="block text-sm font-medium text-gray-700">Nombre de pièces</label>
          <input
            id="rooms"
            v-model.number="propertyData.rooms"
            type="number"
            min="1"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>

        <!-- Salles de bain -->
        <div>
          <label for="bathrooms" class="block text-sm font-medium text-gray-700">Salles de bain</label>
          <input
            id="bathrooms"
            v-model.number="propertyData.bathrooms"
            type="number"
            min="0"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>

        <!-- Étage -->
        <div>
          <label for="floor" class="block text-sm font-medium text-gray-700">Étage</label>
          <input
            id="floor"
            v-model="propertyData.floor"
            type="text"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>

        <!-- Meublé -->
        <div>
          <label for="furnished" class="block text-sm font-medium text-gray-700">Meublé</label>
          <select
            id="furnished"
            v-model="propertyData.furnished"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>
        </div>


        <!-- Équipements -->
        <div class="md:col-span-2">
          <label for="equipment" class="block text-sm font-medium text-gray-700">Équipements</label>
          <input
            id="equipment"
            v-model="propertyData.equipment"
            type="text"
            placeholder="Ex: Cuisine, chauffage, climatiseur, balcon, internet"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>
      </div>

      <!-- Loyer mensuel -->
      <div>
        <label for="rent" class="block text-sm font-medium text-gray-700">Loyer mensuel</label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            id="rent"
            v-model.number="propertyData.rent"
            type="number"
            min="0"
            required
            class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
          >
        </div>
      </div>

      <!-- Charges -->
      <div>
        <label for="charges" class="block text-sm font-medium text-gray-700">Charges</label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            id="charges"
            v-model.number="propertyData.charges"
            type="number"
            min="0"
            class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
          >
        </div>
      </div>

      <!-- Statut -->
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700">Statut</label>
        <select
          id="status"
          v-model="propertyData.status"
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option 
            v-for="[value, label] in Object.entries(propertyStatusLabels)" 
            :key="value" 
            :value="value as PropertyStatus"
          >
            {{ label }}
          </option>
        </select>
      </div>

      <!-- Adresse -->
      <div class="md:col-span-2">
        <label for="address" class="block text-sm font-medium text-gray-700">Adresse</label>
        <textarea
          id="address"
          v-model="propertyData.address"
          rows="2"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>
    </div>

    <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="cancelForm"
        class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Annuler
      </button>
      <button
        type="submit"
        @click="submitForm"
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Enregistrer
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from 'vue';
import { 
  PropertyFormData, 
  PropertyType, 
  PropertyStatus,
  propertyTypeLabels,
  propertyStatusLabels 
} from '@/types/property';

export default defineComponent({
  name: 'PropertyForm',
  
  emits: ['submit', 'cancel'],
  
  props: {
    initialData: {
      type: Object as PropType<Partial<PropertyFormData>>,
      default: () => ({
        name: '',
        type: 'T1',
        area: 0,
        rooms: 1,
        bathrooms: 1,
        floor: '',
        furnished: false,
        equipment: '',
        rent: 0,
        charges: 0,
        status: 'available',
        address: ''
      })
    }
  },
  
  setup(props, { emit }) {
    const propertyData = reactive<PropertyFormData>({
      name: props.initialData.name || '',
      type: props.initialData.type || 'T1',
      area: props.initialData.area || 0,
      rooms: props.initialData.rooms || 1,
      bathrooms: props.initialData.bathrooms || 1,
      floor: props.initialData.floor || '',
      furnished: props.initialData.furnished || false,
      equipment: props.initialData.equipment || '',
      rent: props.initialData.rent || 0,
      charges: props.initialData.charges || 0,
      status: props.initialData.status || 'available',
      address: props.initialData.address || '',
      tags: props.initialData.tags || '',
      isFeatured: props.initialData.isFeatured || false,
      availableFrom: props.initialData.availableFrom || '',
      images: props.initialData.images || [],
      documents: props.initialData.documents || [],
      currency: props.initialData.currency || 'EUR'
    });

    const handleImages = (event: Event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        const newImages: File[] = [];
        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            newImages.push(file);
          }
        }
        propertyData.images = [...propertyData.images, ...newImages];
      }
    };

    const handleDocuments = (event: Event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        const newDocuments: File[] = [];
        for (const file of Array.from(files)) {
          if (file.type.startsWith('application/') || file.type.startsWith('image/')) {
            newDocuments.push(file);
          }
        }
        propertyData.documents = [...propertyData.documents, ...newDocuments];
      }
    };

    const removeImage = (index: number) => {
      propertyData.images.splice(index, 1);
    };

    const removeDocument = (index: number) => {
      propertyData.documents.splice(index, 1);
    };

    const submitForm = () => {
      const formData: PropertyFormData = {
        ...propertyData,
        area: Number(propertyData.area),
        rooms: Number(propertyData.rooms),
        bathrooms: Number(propertyData.bathrooms),
        rent: Number(propertyData.rent),
        charges: Number(propertyData.charges),
        furnished: Boolean(propertyData.furnished),
        isFeatured: Boolean(propertyData.isFeatured),
        tags: propertyData.tags.split(',').map(tag => tag.trim()),
        images: propertyData.images,
        documents: propertyData.documents
      };
      emit('submit', formData);
    };

    const cancelForm = () => {
      emit('cancel');
    };

    return {
      propertyData,
      propertyTypeLabels,
      propertyStatusLabels,
      submitForm,
      cancelForm
    };
  },
  
  // Méthodes compatibles avec l'API Options pour la rétrocompatibilité
  methods: {
    handleSubmit() {
      this.submitForm();
    },
    handleCancel() {
      this.cancelForm();
    }
  }

});
</script>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>