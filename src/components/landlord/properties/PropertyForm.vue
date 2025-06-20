<template>
  <form @submit.prevent="submitForm" class="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- En-tête avec boutons -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">
        <i class="fas fa-home mr-2 text-blue-600"></i>
        {{ propertyData.id ? 'Modifier la propriété' : 'Nouvelle propriété' }}
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

    <!-- Section Caractéristiques supplémentaires -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900 flex items-center">
          <i class="fas fa-list-ul text-blue-600 mr-2"></i>
          Caractéristiques
        </h2>
      </div>
      <div class="p-6">
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
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="furnished"
              v-model="propertyData.furnished"
              type="checkbox"
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="furnished" class="font-medium text-gray-700">Meublé</label>
          </div>
        </div>

        <!-- Mise en avant -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="isFeatured"
              v-model="propertyData.isFeatured"
              type="checkbox"
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="isFeatured" class="font-medium text-gray-700">Mettre en avant</label>
          </div>
        </div>

        <!-- Équipements -->
        <div class="md:col-span-2">
          <label for="equipment" class="block text-sm font-medium text-gray-700">Équipements (séparés par des virgules)</label>
          <input
            id="equipment"
            v-model="equipmentInput"
            type="text"
            @change="updateEquipmentList"
            placeholder="Ex: Cuisine, chauffage, climatiseur, balcon, internet"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
          <div v-if="propertyData.equipment && propertyData.equipment.length > 0" class="mt-2 flex flex-wrap gap-2">
            <span v-for="(item, index) in propertyData.equipment" :key="index" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ item }}
              <button type="button" @click="removeEquipment(index)" class="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300 focus:outline-none">
                <span class="sr-only">Supprimer</span>
                <svg class="h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
                  <path fill-rule="evenodd" d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </span>
          </div>
        </div>



        <!-- Date de disponibilité -->
        <div class="md:col-span-2">
          <label for="availableFrom" class="block text-sm font-medium text-gray-700">Disponible à partir du</label>
          <input
            id="availableFrom"
            v-model="propertyData.availableFrom"
            type="date"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>
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

        <!-- Dépôt de garantie -->
        <div>
          <label for="deposit" class="block text-sm font-medium text-gray-700">Dépôt de garantie (€)</label>
          <input
            id="deposit"
            v-model.number="propertyData.deposit"
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
      </div>
    </div>

    <!-- Pied de page fixe -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 shadow-lg">
      <div class="max-w-5xl mx-auto flex justify-between items-center">
        <div class="text-sm text-gray-500">
          <span class="font-medium">Astuce :</span> Tous les champs marqués d'un astérisque (*) sont obligatoires
        </div>
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
            Enregistrer la propriété
          </button>
        </div>
      </div>
    </div>
    <div class="h-20"></div> <!-- Espace pour le pied de page fixe -->
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, ref, watch, onMounted, onUnmounted } from 'vue';
import { 
  PropertyFormData, 
  PropertyType, 
  PropertyStatus,
  propertyTypeLabels,
  propertyStatusLabels 
} from '@/types/property';
import { usePropertyStore } from '@/stores/propertyStore';

export default defineComponent({
  name: 'PropertyForm',
  
  emits: ['submit', 'cancel'],
  
  props: {
    initialData: {
      type: Object as PropType<Partial<PropertyFormData>>,
      default: () => ({
        type: 'T1',
        area: 0,
        rooms: 1,
        bathrooms: 1,
        floor: '0',
        furnished: false,
        equipment: [],
        rent: 0,
        charges: 0,
        status: 'DISPONIBLE',
        street: '',
        city: '',
        postalCode: '',
        country: 'France',
        currency: 'EUR'
      })
    }
  },
  
  setup(props, { emit }) {
    const propertyStore = usePropertyStore();
    const equipmentInput = ref('');
    
    // Charger le token des propriétés et faire défiler vers le haut au montage
    onMounted(() => {
      propertyStore.loadStoredToken();
      window.scrollTo(0, 0);
    });
    
    // Nettoyer le token lors du démontage du composant
    onUnmounted(() => {
      // Ne pas nettoyer le token ici pour le conserver entre les navigations
      // propertyStore.clearPropertyToken();
    });

    // Initialiser propertyData avec des valeurs par défaut
    const propertyData = reactive<PropertyFormData>({
      type: props.initialData.type || 'T1',
      status: props.initialData.status || 'DISPONIBLE',
      street: props.initialData.street || '',
      city: props.initialData.city || '',
      postalCode: props.initialData.postalCode || '',
      country: props.initialData.country || 'France',
      fullAddress: props.initialData.fullAddress || '',
      latitude: props.initialData.latitude,
      longitude: props.initialData.longitude,
      area: props.initialData.area || 0,
      floorArea: props.initialData.floorArea,
      landArea: props.initialData.landArea,
      rooms: props.initialData.rooms || 1,
      bathrooms: props.initialData.bathrooms || 1,
      floor: props.initialData.floor || '0',
      furnished: props.initialData.furnished || false,
      equipment: props.initialData.equipment || [],
      hasElevator: props.initialData.hasElevator,
      hasParking: props.initialData.hasParking,
      hasBalcony: props.initialData.hasBalcony,
      hasTerrace: props.initialData.hasTerrace,
      hasGarden: props.initialData.hasGarden,
      hasPool: props.initialData.hasPool,
      hasAirConditioning: props.initialData.hasAirConditioning,
      hasHeating: props.initialData.hasHeating,
      yearBuilt: props.initialData.yearBuilt,
      rent: props.initialData.rent || 0,
      charges: props.initialData.charges || 0,
      deposit: props.initialData.deposit || 0,
      currency: props.initialData.currency || 'EUR',
      isFeatured: props.initialData.isFeatured || false,
      availableFrom: props.initialData.availableFrom ? new Date(props.initialData.availableFrom).toISOString().split('T')[0] : '',
    });

    // Initialiser l'input des équipements
    if (props.initialData.equipment) {
      equipmentInput.value = props.initialData.equipment.join(', ');
    }



    const updateEquipmentList = () => {
      if (equipmentInput.value.trim()) {
        const items = equipmentInput.value
          .split(',')
          .map(item => item.trim())
          .filter(item => item);
        propertyData.equipment = [...new Set(items)]; // Éviter les doublons
      } else {
        propertyData.equipment = [];
      }
    };

    const removeEquipment = (index: number) => {
      propertyData.equipment.splice(index, 1);
      equipmentInput.value = propertyData.equipment.join(', ');
    };



    // Mettre à jour l'adresse complète lorsque les champs d'adresse changent
    watch(
      [
        () => propertyData.street,
        () => propertyData.postalCode,
        () => propertyData.city,
        () => propertyData.country
      ],
      () => {
        const addressParts = [
          propertyData.street,
          propertyData.postalCode,
          propertyData.city,
          propertyData.country
        ].filter(Boolean);
        propertyData.fullAddress = addressParts.join(', ');
      },
      { immediate: true }
    );

    const submitForm = async () => {
      try {
        propertyStore.setLoading(true);
        
        const formData: PropertyFormData = {
          ...propertyData,
          area: Number(propertyData.area),
          rooms: Number(propertyData.rooms),
          bathrooms: Number(propertyData.bathrooms),
          rent: Number(propertyData.rent),
          charges: Number(propertyData.charges),
          furnished: Boolean(propertyData.furnished),
          isFeatured: Boolean(propertyData.isFeatured),
        };
        
        // Stocker le token de la propriété si disponible
        if (formData.id) {
          propertyStore.setPropertyToken(formData.id);
        } else if (propertyData.id) {
          propertyStore.setPropertyToken(propertyData.id);
        }
        
        emit('submit', formData);
      } catch (error) {
        console.error('Erreur lors de la soumission du formulaire:', error);
        propertyStore.setError('Une erreur est survenue lors de la sauvegarde de la propriété');
      } finally {
        propertyStore.setLoading(false);
      }
    };

    const cancelForm = () => {
      emit('cancel');
    };

    return {
      propertyData,
      propertyTypeLabels,
      propertyStatusLabels,
      equipmentInput,
      updateEquipmentList,
      removeEquipment,
      submitForm,
      cancelForm,
      isLoading: propertyStore.isLoading,
      propertyError: propertyStore.propertyError
    };
  },
  
  // Méthodes compatibles avec l'API Options pour la rétrocompatibilité
  // Propriétés de données pour la compatibilité avec l'API Options
  data() {
    return {
      // Ces propriétés sont gérées par le store
      // mais sont définies ici pour éviter les avertissements dans le template
      isLoading: false,
      propertyError: null,
      propertyData: {}
    };
  },
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