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

        <!-- Superficie -->
        <div>
          <label for="area" class="block text-sm font-medium text-gray-700">Superficie (m²) <span class="text-red-500">*</span></label>
          <input
            id="area"
            v-model.number="propertyData.area"
            type="number"
            min="1"
            max="10000"
            step="0.5"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ex: 75"
          >
          <p class="mt-1 text-xs text-gray-500">Entre 1 et 10 000 m²</p>
        </div>

        <!-- Surface habitable -->
        <div>
          <label for="floorArea" class="block text-sm font-medium text-gray-700">Surface habitable (m²)</label>
          <input
            id="floorArea"
            v-model.number="propertyData.floorArea"
            type="number"
            min="1"
            max="10000"
            step="0.5"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ex: 65"
          >
          <p class="mt-1 text-xs text-gray-500">Entre 1 et 10 000 m²</p>
        </div>
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
            max="100000"
            step="1"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ex: 500"
          >
          <p class="mt-1 text-xs text-gray-500">Jusqu'à 100 000 m²</p>
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
            <label for="isFeatured" class="font-medium text-gray-700">Mise en avant</label>
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
            @blur="updateEquipmentList"
            placeholder="Ex: FRIGO, LINGE, LAVE_VAISSELLE, MICRO_ONDES, FOUR, PLAQUE_CUISSON, CAVE, GARAGE, PARKING, INTERNET, CLIMATISATION, CHAUFFAGE, MEUBLE, ASCENSEUR, DIGICODE, INTERPHONE, GARDIEN, ALARME"
            :class="[
              'mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm',
              validationErrors.equipment ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            ]"
          >
          <p v-if="validationErrors.equipment" class="mt-1 text-sm text-red-600">
            {{ validationErrors.equipment }}
            <span class="block mt-1 text-xs">
              Équipements valides : FRIGO, LINGE, LAVE_VAISSELLE, MICRO_ONDES, FOUR, PLAQUE_CUISSON, CAVE, GARAGE, PARKING, INTERNET, CLIMATISATION, CHAUFFAGE, MEUBLE, ASCENSEUR, DIGICODE, INTERPHONE, GARDIEN, ALARME
            </span>
          </p>
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <!-- Rue -->
        <div class="md:col-span-2">
          <label for="street" class="block text-sm font-medium text-gray-700">Rue et numéro <span class="text-red-500">*</span></label>
          <input
            id="street"
            v-model="propertyData.street"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ex: 123 Rue de la République"
          />
        </div>
        
        <!-- Complément d'adresse -->
        <div class="md:col-span-2">
          <label for="address" class="block text-sm font-medium text-gray-700">Complément d'adresse</label>
          <textarea
            id="address"
            v-model="propertyData.address"
            rows="2"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Bâtiment, étage, appartement, etc."
          ></textarea>
        </div>
        
        <!-- Code postal -->
        <div>
          <label for="postalCode" class="block text-sm font-medium text-gray-700">Code postal <span class="text-red-500">*</span></label>
          <input
            id="postalCode"
            v-model="propertyData.postalCode"
            type="text"
            required
            pattern="[0-9]{5}"
            title="Veuillez entrer un code postal valide (5 chiffres)"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ex: 75001"
          />
        </div>
        
        <!-- Ville -->
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700">Ville <span class="text-red-500">*</span></label>
          <input
            id="city"
            v-model="propertyData.city"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ex: Paris"
          />
        </div>
      </div>
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
import { defineComponent, ref, reactive, computed, watch, onMounted, onUnmounted, toRaw } from 'vue';
import { usePropertyStore } from "@/stores/propertyStore";
import PropertyService from '@/services/property.service';
import type { PropertyType, PropertyStatus, PropertyFormData } from '@/types/property';

export default defineComponent({
  name: 'PropertyForm',
  
  emits: ['submit', 'cancel'],
  
  props: {
    initialData: {
      type: Object as PropType<Partial<PropertyFormData>>,
      default: () => ({
        id: undefined,
        title: '',
        type: 'APPARTEMENT',  // Valeur par défaut mise à jour
        area: 0,
        rooms: 1,
        bathrooms: 1,
        floor: '0',
        furnished: false,
        equipment: [],
        rent: 0,
        charges: 0,
        status: 'DISPONIBLE',  // Valeur par défaut mise à jour
        street: '',
        city: '',
        postalCode: '',
        country: 'France',
        currency: 'EUR',
        parcelNumber: '',
        name: ''
      })
    }
  },
  
  setup(props, { emit }) {
    // États réactifs
    const isLoading = ref(true);
    const error = ref('');
    const propertyStore = usePropertyStore();
    
    // Définir les valeurs par défaut
    const defaultData: PropertyFormData = {
      id: undefined,
      title: '',
      type: 'APPARTEMENT',
      status: 'DISPONIBLE',
      name: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'congo',
      latitude: undefined,
      longitude: undefined,
      area: 0,
      floorArea: 0,
      landArea: 0,
      parcelNumber: '',
      rooms: 1,
      bathrooms: 1,
      floor: '0',
      furnished: false,
      equipment: [],
      hasElevator: false,
      hasParking: false,
      hasBalcony: false,
      hasTerrace: false,
      hasGarden: false,
      hasPool: false,
      hasAirConditioning: false,
      hasHeating: false,
      yearBuilt: new Date().getFullYear(),
      rent: 0,
      charges: 0,
      deposit: 0,
      currency: 'EUR',
      isFeatured: false,
      availableFrom: new Date().toISOString().split('T')[0]
    };
    
    // Fusionner les valeurs par défaut avec les données initiales
    const initialData = {
      ...defaultData,
      ...props.initialData,
      type: (props.initialData.type as PropertyType) || defaultData.type,
      status: (props.initialData.status as PropertyStatus) || defaultData.status,
      equipment: props.initialData.equipment || []
    };
    
    // Créer l'objet réactif avec les données fusionnées
    const propertyData = reactive<PropertyFormData>(initialData);

    const equipmentInput = ref('');
    const validationErrors = reactive({
      equipment: ''
    });
    
    // Types de propriétés et statuts
    interface MetadataItem {
      value: string;
      label: string;
    }
    
    const propertyTypes = ref<MetadataItem[]>([]);
    const propertyStatuses = ref<MetadataItem[]>([]);
    const propertyEquipments = ref<MetadataItem[]>([]);
    
    // Créer des libellés pour les types et statuts
    const propertyTypeLabels = computed(() => {
      console.log('Types de propriétés disponibles:', propertyTypes.value);
      return propertyTypes.value.reduce((acc: Record<string, string>, type) => {
        acc[type.value] = type.label;
        return acc;
      }, {});
    });
    
    const propertyStatusLabels = computed(() => {
      console.log('Statuts disponibles:', propertyStatuses.value);
      return propertyStatuses.value.reduce((acc: Record<string, string>, status) => {
        acc[status.value] = status.label;
        return acc;
      }, {});
    });
    
    // Charger les métadonnées au montage du composant
    const loadMetadata = async () => {
      try {
        console.log('Chargement des métadonnées...');
        const [types, statuses, equipments] = await Promise.all([
          PropertyService.getPropertyTypes(),
          PropertyService.getPropertyStatuses(),
          PropertyService.getPropertyEquipments()
        ]);
        
        console.log('Métadonnées chargées:', { types, statuses, equipments });
        
        propertyTypes.value = Array.isArray(types) ? types : [];
        propertyStatuses.value = Array.isArray(statuses) ? statuses : [];
        propertyEquipments.value = Array.isArray(equipments) ? equipments : [];
        
        // Valeurs par défaut si les listes sont vides
        if (propertyTypes.value.length === 0) {
          console.warn('Aucun type de propriété trouvé, utilisation des valeurs par défaut');
          propertyTypes.value = [
            { value: 'APPARTEMENT', label: 'Appartement' },
            { value: 'MAISON', label: 'Maison' },
            { value: 'TERRAIN', label: 'Terrain' }
          ];
        }
        
        if (propertyStatuses.value.length === 0) {
          console.warn('Aucun statut trouvé, utilisation des valeurs par défaut');
          propertyStatuses.value = [
            { value: 'DISPONIBLE', label: 'Disponible' },
            { value: 'LOUE', label: 'Loué' },
            { value: 'INDISPONIBLE', label: 'Indisponible' }
          ];
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement des métadonnées:', err);
        error.value = 'Impossible de charger les métadonnées. Veuillez réessayer.';
        
        // Valeurs par défaut en cas d'erreur
        propertyTypes.value = [
          { value: 'APPARTEMENT', label: 'Appartement' },
          { value: 'MAISON', label: 'Maison' },
          { value: 'TERRAIN', label: 'Terrain' }
        ];
        
        propertyStatuses.value = [
          { value: 'DISPONIBLE', label: 'Disponible' },
          { value: 'LOUE', label: 'Loué' },
          { value: 'INDISPONIBLE', label: 'Indisponible' }
        ];
      } finally {
        isLoading.value = false;
      }
    };
    
    // Charger les métadonnées au montage
    onMounted(() => {
      loadMetadata();
    });

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

    // Mettre à jour propertyData si les props changent
    const updatePropertyData = (newData: any) => {
      if (newData) {
        const updatedData: any = {
          ...defaultData, // Toujours partir des valeurs par défaut
          ...newData,    // Puis appliquer les nouvelles valeurs
          type: (newData.type as PropertyType) || defaultData.type,
          status: (newData.status as PropertyStatus) || defaultData.status,
          equipment: Array.isArray(newData.equipment) ? [...newData.equipment] : [],
          availableFrom: newData.availableFrom 
            ? new Date(newData.availableFrom).toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0]
        };
        
        // Mettre à jour chaque propriété individuellement pour préserver la réactivité
        Object.keys(updatedData).forEach((key: string) => {
          (propertyData as any)[key] = updatedData[key];
        });
      }
    };
    
    // Observer les changements de initialData
    watch(() => props.initialData, updatePropertyData, { immediate: true, deep: true });

    // Initialiser l'input des équipements
    if (props.initialData.equipment) {
      equipmentInput.value = props.initialData.equipment.join(', ');
    }

    const validateEquipment = () => {
      const validEquipment = [
        'FRIGO', 'LINGE', 'LAVE_VAISSELLE', 'MICRO_ONDES', 'FOUR', 'PLAQUE_CUISSON', 
        'CAVE', 'GARAGE', 'PARKING', 'INTERNET', 'CLIMATISATION', 'CHAUFFAGE', 
        'MEUBLE', 'ASCENSEUR', 'DIGICODE', 'INTERPHONE', 'GARDIEN', 'ALARME'
      ];
      
      if (equipmentInput.value.trim()) {
        const items = equipmentInput.value
          .split(',')
          .map(item => item.trim().toUpperCase())
          .filter(item => item);
          
        const invalidItems = items.filter(item => !validEquipment.includes(item));
        
        if (invalidItems.length > 0) {
          validationErrors.equipment = `Équipements non valides : ${invalidItems.join(', ')}`;
          return false;
        } else {
          validationErrors.equipment = '';
          return true;
        }
      } else {
        validationErrors.equipment = '';
        return true;
      }
    };

    const updateEquipmentList = () => {
      validateEquipment(); // Valider les équipements lors de la mise à jour
      if (equipmentInput.value.trim()) {
        const items = equipmentInput.value
          .split(',')
          .map(item => item.trim())
          .filter(item => item);
        propertyData.equipment = [...new Set(items)]; // Éviter les doublons
      } else {
        propertyData.equipment = [];
      }
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



    // La gestion de l'adresse complète a été supprimée

    // Validation des champs du formulaire
    const validateForm = (): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      // Validation du code postal (5 chiffres exactement)
      if (!propertyData.postalCode || !/^\d{5}$/.test(propertyData.postalCode)) {
        errors.push('Le code postal doit contenir exactement 5 chiffres');
      }
      
      // Validation de la ville (obligatoire)
      if (!propertyData.city || propertyData.city.trim().length === 0) {
        errors.push('La ville est obligatoire');
      }
      
      // Validation du titre (obligatoire)
      if (!propertyData.title || propertyData.title.trim().length === 0) {
        errors.push('Le titre est obligatoire');
      }
      
      // Validation de la surface (positive)
      if (!propertyData.area || Number(propertyData.area) <= 0) {
        errors.push('La surface doit être supérieure à 0');
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    };

    const submitForm = async () => {
      console.log('=== DÉBUT SOUMISSION DU FORMULAIRE ===');
      console.log('1. Début de la soumission du formulaire');
      
      try {
        console.log('2. Validation du formulaire en cours...');
        const { valid, errors } = validateForm();
        
        if (!valid) {
          console.error('2.1 Validation échouée - Erreurs:', errors);
          error.value = errors.join('\n');
          return;
        }
        
        console.log('2.2 Validation réussie - Données du formulaire:', JSON.parse(JSON.stringify(propertyData)));
        
        propertyStore.setLoading(true);
        
        console.log('3. Préparation des données pour envoi...');
        propertyStore.setLoading(true);
        
        // Nettoyage des équipements
        const cleanEquipment = Array.isArray(propertyData.equipment)
          ? propertyData.equipment.filter(Boolean).map(item => item.toString().trim())
          : [];
          
        console.log('3.1 Équipements nettoyés:', cleanEquipment);
        
        // Préparer les données pour l'envoi avec des valeurs par défaut appropriées
        console.log('4. Création de l\'objet formData...');
        
        const formData: any = {
          // Informations de base (toujours requises)
          title: propertyData.title.trim(),
          description: (propertyData.description || '').trim(),
          type: propertyData.type,
          status: propertyData.status || 'DISPONIBLE',
          
          // Adresse
          street: propertyData.street.trim(), // Champ obligatoire
          city: propertyData.city.trim(),
          postal_code: propertyData.postalCode.trim(),
          country: (propertyData.country || 'France').trim(),
          address: [
            propertyData.street,
            propertyData.postalCode,
            propertyData.city,
            propertyData.country
          ].filter(Boolean).join(', '),
          // Caractéristiques
          area: Math.max(0, Number(propertyData.area) || 0),
          land_area: Math.max(0, Number(propertyData.landArea) || undefined),
          rooms: Math.max(1, Number(propertyData.rooms) || 1),
          bathrooms: Math.max(1, Number(propertyData.bathrooms) || 1),
          floor: propertyData.floor ? Math.max(0, Number(propertyData.floor)) : 0,
          furnished: Boolean(propertyData.furnished),
          equipment: cleanEquipment,
          
          // Équipements booléens
          has_elevator: Boolean(propertyData.hasElevator),
          has_parking: Boolean(propertyData.hasParking),
          has_balcony: Boolean(propertyData.hasBalcony),
          has_terrace: Boolean(propertyData.hasTerrace),
          has_garden: Boolean(propertyData.hasGarden),
          has_pool: Boolean(propertyData.hasPool),
          has_air_conditioning: Boolean(propertyData.hasAirConditioning),
          has_heating: Boolean(propertyData.hasHeating),
          
          // Financier
          rent: Math.max(0, Number(propertyData.rent) || 0),
          charges: Math.max(0, Number(propertyData.charges) || 0),
          deposit: propertyData.deposit ? Math.max(0, Number(propertyData.deposit)) : undefined,
          currency: propertyData.currency || 'EUR',
          
          // Autres
          year_built: propertyData.yearBuilt ? Math.max(1000, Math.min(2100, Number(propertyData.yearBuilt))) : undefined,
          is_featured: Boolean(propertyData.isFeatured),
          available_from: propertyData.availableFrom || new Date().toISOString().split('T')[0],
        };
        
        console.log('5. Nettoyage des champs vides ou undefined...');
        // Nettoyer les champs undefined et les chaînes vides
        Object.keys(formData).forEach(key => {
          if (formData[key] === undefined || formData[key] === '') {
            console.log(`   - Suppression du champ vide: ${key}`);
            delete formData[key];
          }
        });
        
        console.log('5.1 Données après nettoyage:', formData);
        
        console.log('6. Données finales prêtes pour envoi:', JSON.stringify(formData, null, 2));
        
        // Stocker le token de la propriété si disponible
        if (propertyData.id) {
          console.log(`6.1 Définition du token pour la propriété ID: ${propertyData.id}`);
          propertyStore.setPropertyToken(propertyData.id);
        } else {
          console.log('6.1 Aucun ID de propriété existant, création d\'une nouvelle propriété');
        }
        
        console.log('7. Émission de l\'événement submit avec les données du formulaire');
        emit('submit', formData);
        console.log('8. Événement submit émis avec succès');
      } catch (error) {
        console.error('=== ERREUR LORS DE LA SOUMISSION ===');
        console.error('Erreur détaillée:', error);
        if (error.response) {
          // La requête a été faite et le serveur a répondu avec un code d'erreur
          console.error('Détails de la réponse d\'erreur:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          console.error('Aucune réponse reçue du serveur. Requête:', error.request);
        } else {
          // Une erreur s'est produite lors de la configuration de la requête
          console.error('Erreur lors de la configuration de la requête:', error.message);
        }
        console.error('Stack trace:', error.stack);
        
        propertyStore.setError('Une erreur est survenue lors de la sauvegarde de la propriété');
        console.error('=== FIN DU TRACAGE D\'ERREUR ===');
      } finally {
        console.log('9. Fin du processus de soumission - Réinitialisation de l\'état de chargement');
        propertyStore.setLoading(false);
        console.log('=== FIN DU PROCESSUS DE SOUMISSION ===');
      }
    };

    const cancelForm = () => {
      emit('cancel');
    };

    // S'assurer que propertyData est bien exposé et réactif
    const exposedData = {
      propertyData,
      propertyTypes: propertyTypes,
      propertyStatuses: propertyStatuses,
      propertyEquipments: propertyEquipments,
      propertyTypeLabels,
      propertyStatusLabels,
      equipmentInput,
      validationErrors,
      error,
      updateEquipmentList,
      validateEquipment,
      removeEquipment,
      submitForm,
      cancelForm,
      isLoading: computed(() => isLoading.value || propertyStore.isLoading),
      propertyError: propertyStore.propertyError
    };
    
    // Afficher l'état pour le débogage
    onMounted(() => {
      console.log('PropertyForm monté avec les données:', {
        propertyData: toRaw(propertyData),
        propertyTypes: toRaw(propertyTypes.value),
        propertyStatuses: toRaw(propertyStatuses.value)
      });
    });
    
    return exposedData;
  },
  
  // Méthodes compatibles avec l'API Options pour la rétrocompatibilité
  // Propriétés de données pour la compatibilité avec l'API Options
  data() {
    return {
      // Ces propriétés sont gérées par le store
      // mais sont définies ici pour éviter les avertissements dans le template
      isLoading: false,
      propertyError: null
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