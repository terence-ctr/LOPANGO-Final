<template>
  <div :class="['bg-white rounded-lg shadow-md p-6', { 'max-w-3xl mx-auto': !fullWidth }]" :style="containerStyle">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">
        {{ isEditing ? 'Modifier le logement' : 'Ajouter un nouveau logement' }}
      </h2>
      <button 
        v-if="showCloseButton"
        @click="$emit('cancel')" 
        class="text-gray-500 hover:text-gray-700"
      >
        <FontAwesomeIcon icon="times" class="text-xl" />
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Informations de base -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nom du logement -->
        <div class="space-y-2">
          <label for="name" class="block text-sm font-medium text-gray-700">
            Nom du logement <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Ex: Appartement B20"
          />
        </div>

        <!-- Type de propriété -->
        <div class="space-y-2">
          <label for="type" class="block text-sm font-medium text-gray-700">
            Type de propriété <span class="text-red-500">*</span>
          </label>
          <select
            id="type"
            v-model="formData.type"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Sélectionnez un type</option>
            <option value="appartement">Appartement</option>
            <option value="maison">Maison</option>
            <option value="bureau">Bureau</option>
            <option value="local">Local commercial</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      <!-- Adresse -->
      <div class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900">Adresse</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Rue -->
          <div class="col-span-2">
            <label for="street" class="block text-sm font-medium text-gray-700">
              Adresse <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-1 gap-2">
              <div>
                <input
                  id="street"
                  :value="formData.address?.street || ''"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Ex: 123 Rue de la République"
                  @input="updateAddress('street', $event.target.value)"
                />
                <p class="mt-1 text-xs text-gray-500">Numéro et nom de la rue</p>
              </div>
            </div>
          </div>

          <!-- Code postal -->
          <div class="col-span-1">
            <label for="postalCode" class="block text-sm font-medium text-gray-700">
              Code postal
            </label>
            <input
              id="postalCode"
              :value="formData.address?.postalCode || ''"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ex: 243 (optionnel)"
              @input="updateAddress('postalCode', $event.target.value)"
            />
            <p class="mt-1 text-xs text-gray-500">Code postal (optionnel)</p>
          </div>

          <!-- Numéro de parcelle -->
          <div>
            <label for="parcelNumber" class="block text-sm font-medium text-gray-700">
              Numéro de parcelle <span class="text-red-500">*</span>
            </label>
            <input
              id="parcelNumber"
              :value="formData.address?.parcelNumber"
              @input="formData.address = { ...formData.address, parcelNumber: $event.target.value }"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ex: 1234"
            />
            <p v-if="errors.address?.parcelNumber" class="mt-1 text-sm text-red-600">
              {{ errors.address.parcelNumber }}
            </p>
          </div>

          <!-- Ville -->
          <div class="col-span-1">
            <label for="city" class="block text-sm font-medium text-gray-700">
              Ville/Commune <span class="text-red-500">*</span>
            </label>
            <input
              id="city"
              :value="formData.address?.city || ''"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ex: Gombe, Kinshasa"
              @input="updateAddress('city', $event.target.value)"
            />
            <p class="mt-1 text-xs text-gray-500">Ville et commune</p>
          </div>

        </div>
      </div>

      <!-- Détails du logement -->
      <div class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900">Détails du logement</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Surface -->
          <div>
            <label for="surface" class="block text-sm font-medium text-gray-700">
              Surface (m²) <span class="text-red-500">*</span>
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input
                id="surface"
                v-model.number="formData.surface"
                type="number"
                min="0"
                step="0.5"
                required
                class="mt-1 block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3"
                placeholder="0"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span class="text-gray-500 sm:text-sm">m²</span>
              </div>
            </div>
          </div>

          <!-- Nombre de pièces -->
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
              placeholder="Ex: 3"
            />
          </div>

          <!-- Étage -->
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
      </div>

      <!-- Statut de la propriété -->
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Statut -->
          <div class="space-y-2">
            <label for="status" class="block text-sm font-medium text-gray-700">
              Statut <span class="text-red-500">*</span>
            </label>
            <select
              id="status"
              v-model="formData.status"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Sélectionnez un statut</option>
              <option value="Actif">Actif</option>
              <option value="En attente">En attente</option>
              <option value="En maintenance">En maintenance</option>
              <option value="Inactif">Inactif</option>
              <option value="Loué">Loué</option>
              <option value="Disponible">Disponible</option>
            </select>
          </div>
          
          <!-- Champ pour le loyer (uniquement pour les bailleurs) -->
          <div v-if="showRentField" class="space-y-2">
            <label for="rent" class="block text-sm font-medium text-gray-700">
              Loyer mensuel <span class="text-red-500">*</span>
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                id="rent"
                v-model.number="formData.rent"
                type="number"
                :required="showRentField"
                class="block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
                placeholder="0,00"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">/mois</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Équipements -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Équipements</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="equipment in equipmentOptions" :key="equipment.id" class="flex items-start">
            <div class="flex items-center h-5">
              <input
                :id="`equipment-${equipment.id}`"
                v-model="formData.equipments"
                type="checkbox"
                :value="equipment.id"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div class="ml-3 text-sm">
              <label :for="`equipment-${equipment.id}`" class="font-medium text-gray-700">
                {{ equipment.label }}
              </label>
              <p v-if="equipment.description" class="text-gray-500">{{ equipment.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Champs personnalisés -->
      <slot></slot>

      <!-- Boutons d'action -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          v-if="showCancelButton"
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enregistrement...
          </span>
          <span v-else>
            {{ isEditing ? 'Mettre à jour' : submitButtonText || 'Enregistrer' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const props = defineProps({
  // Données initiales du formulaire
  initialData: {
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
      equipments: []
    })
  },
  // Options de configuration
  showRentField: {
    type: Boolean,
    default: false
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  submitButtonText: {
    type: String,
    default: ''
  },
  containerStyle: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['submit', 'cancel']);

const isSubmitting = ref(false);

// Initialisation de l'objet errors
const errors = reactive({
  address: {
    parcelNumber: ''
  }
});

// Options pour les équipements
const equipmentOptions = [
  { id: 'elevator', label: 'Ascenseur' },
  { id: 'parking', label: 'Parking' },
  { id: 'balcony', label: 'Balcon' },
  { id: 'terrace', label: 'Terrasse' },
  { id: 'garden', label: 'Jardin' },
  { id: 'basement', label: 'Cave' },
  { id: 'intercom', label: 'Interphone' },
  { id: 'digicode', label: 'Digicode' },
  { id: 'caretaker', label: 'Gardien' }
];

// Fonction utilitaire pour créer un objet d'adresse vide
const createEmptyAddress = () => ({
  street: '',
  postalCode: '',
  city: '',
  country: 'France',
  parcelNumber: '',
  additionalInfo: ''
});

// Données du formulaire avec initialisation complète de l'adresse
const formData = reactive({
  name: '',
  type: '',
  status: 'Disponible',
  address: createEmptyAddress(),
  surface: null,
  rooms: 1,
  floor: null,
  rent: null,
  equipments: [],
  isFurnished: false,
  hasParking: false,
  hasElevator: false,
  hasBalcony: false,
  hasTerrace: false,
  hasGarden: false,
  hasPool: false,
  hasAirConditioning: false,
  hasHeating: false
});

// S'assurer que l'adresse est toujours un objet valide
const safeAddress = computed(() => formData?.address || createEmptyAddress());

// Fonction utilitaire pour accéder en toute sécurité aux propriétés imbriquées
const safeGet = (obj, path, defaultValue = '') => {
  return path.split('.').reduce((acc, key) => {
    return (acc && acc[key] !== undefined) ? acc[key] : defaultValue;
  }, obj);
};

// Déclarer le nom du composant
const componentName = 'BasePropertyForm';

// Gestion de l'adresse
const updateAddress = (field, value) => {
  formData.address = {
    ...formData.address,
    [field]: value
  };
};

// Formater l'adresse pour l'affichage
const formattedAddress = computed(() => {
  const parts = [];
  const { street, city, postalCode } = formData.address || {};
  
  if (street) parts.push(street);
  if (city) parts.push(city);
  if (postalCode) parts.push(postalCode);
  
  return parts.join(', ');
});

// Initialiser les champs d'adresse
const initializeAddress = (address) => {
  if (!address) return;
  
  // Si l'adresse est une chaîne, essayer de la parser
  if (typeof address === 'string') {
    try {
      address = JSON.parse(address);
    } catch (e) {
      console.warn('Impossible de parser l\'adresse', e);
      address = {};
    }
  }
  
  // Mettre à jour les champs d'adresse
  formData.address = {
    ...address,
    street: address.street || '',
    city: address.city || '',
    postalCode: address.postalCode || ''
  };
};

// Initialisation du formulaire au montage du composant
onMounted(() => {
  if (props.initialData) {
    // Créer un objet avec les valeurs par défaut
    const defaultValues = {
      name: '',
      type: '',
      status: 'Disponible',
      address: createEmptyAddress(),
      surface: null,
      rooms: 1,
      floor: null,
      rent: null,
      purchasePrice: null,
      purchaseDate: '',
      landlordNotes: '',
      equipments: [],
      isFurnished: false,
      hasParking: false,
      hasElevator: false,
      hasBalcony: false,
      hasTerrace: false,
      hasGarden: false,
      hasPool: false,
      hasAirConditioning: false,
      hasHeating: false
    };

    // Fusionner avec les nouvelles données
    const mergedData = {
      ...defaultValues,
      ...props.initialData,
      address: {
        ...defaultValues.address,
        ...(props.initialData.address || {})
      }
    };

    // Mettre à jour formData
    Object.assign(formData, mergedData);
  }
});

// Surveiller les changements de l'adresse pour la mise à jour en temps réel
watch(() => props.initialData?.address, (newAddress) => {
  if (newAddress) {
    formData.address = {
      ...createEmptyAddress(),
      ...newAddress
    };
  }
}, { immediate: true });

const handleSubmit = async () => {
  isSubmitting.value = true;
  
  try {
    // Créer une copie des données du formulaire pour l'événement
    const formDataCopy = JSON.parse(JSON.stringify(formData));
    
    // Émettre l'événement avec les données du formulaire
    emit('submit', formDataCopy);
    
    // Réinitialiser le formulaire si nécessaire
    if (!props.isEditing) {
      Object.assign(formData, {
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
        equipments: []
      });
    }
  } catch (error) {
    console.error('Erreur lors de la soumission du formulaire :', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Styles pour les champs de formulaire */
input[type="text"],
input[type="number"],
input[type="email"],
input[type="tel"],
select,
textarea {
  height: 2.5rem;
  padding: 0.5rem 0.75rem;
  line-height: 1.25;
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

select {
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}

/* Ajustement pour les champs dans la grille */
.grid > div > input,
.grid > div > select {
  width: 100%;
}

/* Ajustement pour les champs avec icône */
.relative > input {
  padding-right: 2.5rem;
}

/* Style pour les boutons */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animation de chargement */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
