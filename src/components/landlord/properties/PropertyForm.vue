<template>
  <div v-if="isLoading" class="flex justify-center items-center p-8">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
  <form v-else @submit.prevent="submitForm" class="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- En-tête avec boutons -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">
        <i class="fas fa-home mr-2 text-blue-600"></i>
        {{ propertyData?.id ? 'Modifier la propriété' : 'Nouvelle propriété' }}
      </h2>
      <div class="flex space-x-3">
        <button
          type="button"
          @click="cancelForm"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i class="fas fa-times mr-2"></i>
          Annuler
        </button>
        <button
          type="submit"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i class="fas fa-save mr-2"></i>
          Enregistrer
        </button>
      </div>
    </div>

    <!-- Section Informations de base -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 flex items-center">
          <i class="fas fa-info-circle text-blue-600 mr-2"></i>
          Informations de base
        </h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Titre de l'annonce -->
          <div class="md:col-span-2">
            <label for="title" class="block text-sm font-medium text-gray-700">Titre de la propriété <span class="text-red-500">*</span></label>
            <input
              id="title"
              v-model="propertyData.title"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ex: Magnifique appartement avec vue sur la mer"
            />
          </div>
          
          <!-- Type de bien -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700">Type de bien <span class="text-red-500">*</span></label>
            <select
              id="type"
              v-model="propertyData.type"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option 
                v-for="type in propertyTypes" 
                :key="type.value" 
                :value="type.value"
              >
                {{ type.label }}
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
                v-for="status in propertyStatuses" 
                :key="status.value" 
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

        </div>
      </div>
    </div>

    <!-- Section Caractéristiques -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 flex items-center">
          <i class="fas fa-ruler-combined text-blue-600 mr-2"></i>
          Caractéristiques
        </h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Superficie -->
          <div>
            <label for="area" class="block text-sm font-medium text-gray-700">Superficie (m²)</label>
            <input
              id="area"
              v-model.number="propertyData.area"
              type="number"
              min="1"
              max="10000"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ex: 75"
            >
            <p class="mt-1 text-xs text-gray-500">Entre 1 et 10 000 m²</p>
          </div>
          <!-- Nombre de pièces -->
          <div>
            <label for="rooms" class="block text-sm font-medium text-gray-700">Nombre de pièces</label>
            <input
              id="rooms"
              v-model.number="propertyData.rooms"
              type="number"
              min="1"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ex: 3"
            >
          </div>
          <!-- Nombre de salles de bain -->
          <div>
            <label for="bathrooms" class="block text-sm font-medium text-gray-700">Salles de bain</label>
            <input
              id="bathrooms"
              v-model.number="propertyData.bathrooms"
              type="number"
              min="1"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ex: 1"
            >
          </div>
          <!-- Étage -->
          <div class="md:col-span-1">
            <label for="floor" class="block text-sm font-medium text-gray-700">Étage</label>
            <input
              id="floor"
              v-model="propertyData.floor"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ex: 2 ou Rez-de-chaussée"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Section Adresse -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 flex items-center">
          <i class="fas fa-map-marker-alt text-blue-600 mr-2"></i>
          Adresse
        </h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Rue -->
          <div class="md:col-span-2">
            <label for="street" class="block text-sm font-medium text-gray-700">Adresse complète</label>
            <input 
              id="street" 
              v-model="propertyData.street" 
              type="text" 
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              placeholder="123 Avenue de la Victoire"
            >
          </div>
          
          <!-- Ville -->
          <div class="md:col-span-1">
            <label for="city" class="block text-sm font-medium text-gray-700">Ville</label>
            <input 
              id="city" 
              v-model="propertyData.city" 
              type="text" 
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              placeholder="Kinshasa"
            >
          </div>
          
          <!-- Code Postal -->
          <div class="md:col-span-1">
            <label for="postal_code" class="block text-sm font-medium text-gray-700">Code Postal</label>
            <input 
              id="postal_code" 
              v-model="propertyData.postal_code" 
              type="text" 
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              placeholder="">
          </div>
          
          <!-- Pays -->
          <div class="md:col-span-2">
            <label for="country" class="block text-sm font-medium text-gray-700">Pays</label>
            <input id="country" v-model="propertyData.country" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="République Démocratique du Congo">
          </div>
        </div>
      </div>
    </div>

    <!-- Section Equipements -->
    <div class="bg-white shadow-sm rounded-lg  mb-6">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 flex items-center">
          <i class="fas fa-couch text-blue-600 mr-2"></i>
          Equipements
        </h2>
      </div>
      <div class="p-6">
        <div class="flex flex-wrap items-center gap-2 mb-2">
          <span 
            v-for="(tag, index) in propertyData.equipment" 
            :key="index"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            {{ tag }}
            <button 
              @click="removeEquipment(index)"
              type="button"
              class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
            >
              <span class="sr-only">Remove</span>
              <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
              </svg>
            </button>
          </span>
        </div>
        <div class="relative">
          <input
            type="text"
            v-model="equipmentInput"
            @keydown.enter.prevent="addEquipment(equipmentInput)"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ajouter un équipement (ex: Climatisation) et appuyez sur Entrée"
          >
          <ul v-if="filteredEquipments.length > 0" class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            <li 
              v-for="suggestion in filteredEquipments" 
              :key="suggestion.value"
              @click="addEquipment(suggestion.label)"
              class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
            >
              <span class="font-normal block truncate">{{ suggestion.label }}</span>
            </li>
          </ul>
        </div>
        <p class="mt-2 text-xs text-gray-500">
          Ajoutez des équipements un par un. Vous pouvez choisir parmi les suggestions ou ajouter les vôtres.
        </p>
      </div>
    </div>

    <!-- Section Financier -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 flex items-center">
          <i class="fas fa-euro-sign text-blue-600 mr-2"></i>
          Informations financières
        </h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Loyer -->
          <div>
            <label for="rent" class="block text-sm font-medium text-gray-700">Loyer mensuel (€)</label>
            <input
              id="rent"
              v-model.number="propertyData.rent"
              type="number"
              min="0"
              step="0.01"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>

          <!-- Charges -->
          <div>
            <label for="charges" class="block text-sm font-medium text-gray-700">Charges (€/mois)</label>
            <input
              id="charges"
              v-model.number="propertyData.charges"
              type="number"
              min="0"
              step="0.01"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>

          <!-- Devise -->
          <div>
            <label for="currency" class="block text-sm font-medium text-gray-700">Devise</label>
            <select
              id="currency"
              v-model="propertyData.currency"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF (CHF)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { usePropertyStore } from '@/stores/propertyStore';
import { storeToRefs } from 'pinia';
import type { Property, PropertyFormData, PropertyType, PropertyStatus, PropertyTypeMetadata, PropertyEquipmentMetadata } from '@/types/property';

export default defineComponent({
  name: 'PropertyForm',
  props: {
    propertyId: {
      type: Number,
      default: null
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const propertyStore = usePropertyStore();
    const { 
      getCurrentProperty, 
      getPropertyTypes, 
      getPropertyStatuses, 
      getPropertyEquipments
    } = storeToRefs(propertyStore);
    
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const propertyData = ref<Partial<PropertyFormData>>({
      title: '',
      type: 'APPARTEMENT',
      status: 'DISPONIBLE',
      street: '',
      city: '',
      postal_code: '',
      country: 'Congo',
      fullAddress: '',
      area: 0,
      rooms: 1,
      bathrooms: 1,
      floor: '0',
      furnished: false,
      equipment: [],
      rent: 0,
      charges: 0,
      deposit: 0,
      currency: 'EUR',
    });

    const addressNumero = ref('');
    const addressAvenue = ref('');

    onMounted(async () => {
      try {
        isLoading.value = true;
        await propertyStore.fetchPropertyMetadata();
        if (props.propertyId) {
          await propertyStore.fetchPropertyById(props.propertyId);
        }
      } catch (err) {
        error.value = 'Erreur lors du chargement des données';
        console.error('Erreur:', err);
      } finally {
        isLoading.value = false;
      }
    });

            watch(getCurrentProperty, (newVal) => {
      if (newVal && newVal.id === props.propertyId) {
        const data: Partial<PropertyFormData> = {
            id: newVal.id,
            title: newVal.title,
            description: newVal.description,
            type: newVal.type,
            status: newVal.status,
            area: newVal.area,
            rooms: newVal.rooms,
            bathrooms: newVal.bathrooms,
            floor: String(newVal.floor || '0'),
            furnished: newVal.furnished,
            equipment: Array.isArray(newVal.equipment) ? [...newVal.equipment] : [],
            rent: newVal.rent,
            charges: newVal.charges || 0,
            deposit: newVal.deposit || 0,
            currency: newVal.currency || 'EUR',
            // Gestion de l'adresse
            ...(typeof newVal.address === 'string' 
              ? parseAddressString(newVal.address)
              : {
                  street: newVal.address?.street || '',
                  city: newVal.address?.city || 'Kinshasa',
                  postal_code: newVal.address?.postal_code || '',
                  country: newVal.address?.country || 'Congo',
                  fullAddress: newVal.address 
                    ? `${newVal.address.street || ''}, ${newVal.address.city || ''}, ${newVal.address.postal_code || ''}, ${newVal.address.country || ''}`
                    : '',
                  latitude: newVal.address?.latitude,
                  longitude: newVal.address?.longitude
                }),
            images: [] // Keep images as empty File array to avoid type conflict
        };
        
        propertyData.value = data;

        if (data.street) {
            const streetParts = data.street.split(' ');
            const numero = streetParts[0];
            if (/^\d+[a-zA-Z]*$/.test(numero)) {
                addressNumero.value = numero;
                addressAvenue.value = streetParts.slice(1).join(' ');
            } else {
                addressNumero.value = '';
                addressAvenue.value = data.street;
            }
        } else {
            addressNumero.value = '';
            addressAvenue.value = '';
        }
      }
    }, { immediate: true, deep: true });

    watch([addressNumero, addressAvenue], ([newNumero, newAvenue]) => {
      propertyData.value.street = `${newNumero} ${newAvenue}`.trim();
    });

    const equipmentInput = ref('');

    const filteredEquipments = computed(() => {
      if (!equipmentInput.value || !getPropertyEquipments.value) return [];
      return getPropertyEquipments.value.filter((eq: PropertyEquipmentMetadata) => 
        eq.label.toLowerCase().includes(equipmentInput.value.toLowerCase()) &&
        !propertyData.value.equipment?.includes(eq.label)
      );
    });

    const addEquipment = (equipment: string) => {
      if (equipment) {
        const upperEquipment = equipment.toUpperCase();
        if (!propertyData.value.equipment) propertyData.value.equipment = [];
        if (!propertyData.value.equipment.includes(upperEquipment)) {
          propertyData.value.equipment.push(upperEquipment);
        }
      }
      equipmentInput.value = '';
    };

    const removeEquipment = (index: number) => {
      propertyData.value.equipment?.splice(index, 1);
    };

    const validateForm = (): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      if (!propertyData.value.title?.trim()) errors.push('Le titre est requis');
      if (!propertyData.value.area || propertyData.value.area <= 0) errors.push('La superficie doit être supérieure à 0');
      if (propertyData.value.rent === undefined || propertyData.value.rent < 0) errors.push('Le loyer doit être un nombre positif');
      return { valid: errors.length === 0, errors };
    };

    const submitForm = async () => {
      error.value = null;
      const validation = validateForm();
      if (!validation.valid) {
        error.value = validation.errors.join('\n');
        return;
      }

      try {
        isLoading.value = true;
        // Create a mutable copy of the form data
        const dataToSubmit: Record<string, any> = { ...propertyData.value };

        // Set the address as an object with the standardized structure
        dataToSubmit.address = {
          street: dataToSubmit.street || '',
          city: dataToSubmit.city || '',
          postal_code: dataToSubmit.postal_code || '',
          country: dataToSubmit.country || 'Congo'
        };

        // Clean up address-related fields
        delete dataToSubmit.street;
        delete dataToSubmit.city;
        delete dataToSubmit.postal_code;
        delete dataToSubmit.country;
        delete dataToSubmit.fullAddress;

        // Remove file arrays, as they are likely handled separately
        if ('images' in dataToSubmit) {
          delete dataToSubmit.images;
        }
        if ('documents' in dataToSubmit) {
          delete dataToSubmit.documents;
        }

        // Ensure 'id' is not sent for new properties
        if ('id' in dataToSubmit && !props.propertyId) {
          delete dataToSubmit.id;
        }

        if (props.propertyId) {
          await propertyStore.updateProperty(props.propertyId, dataToSubmit as Partial<Property>);
        } else {
          await propertyStore.createProperty(dataToSubmit as Omit<Property, 'id'>);
        }
        emit('submit');
      } catch (e) {
        console.error('Submission error:', e);
        error.value = 'Une erreur est survenue lors de la soumission.';
      } finally {
        isLoading.value = false;
      }
    };

    const cancelForm = () => {
      emit('cancel');
    };

    return {
      propertyData,
      isLoading,
      error,
      propertyTypes: getPropertyTypes,
      propertyStatuses: getPropertyStatuses,
      propertyEquipments: getPropertyEquipments,
      submitForm,
      cancelForm,
      addressNumero,
      addressAvenue,
      equipmentInput,
      filteredEquipments,
      addEquipment,
      removeEquipment
    };
  }
});

// Fonction utilitaire pour parser une adresse sous forme de chaîne
function parseAddressString(addressStr: string): Partial<PropertyFormData> {
  if (!addressStr) return {};
  
  const parts = addressStr.split(',').map(p => p.trim());
  return {
    street: parts[0] || '',
    city: parts[1] || 'Kinshasa',
    postal_code: parts[2] || '',
    country: parts[3] || 'Congo',
    fullAddress: addressStr
  };
}
</script>
