<template>
  <BasePropertyForm
    :initial-data="initialData"
    :is-editing="isEditing"
    :show-rent-field="true"
    :submit-button-text="submitButtonText"
    :is-loading="isLoading"
    :errors="validationErrors"
    @submit="handleSubmit"
    @cancel="$emit('cancel')"
  >
    <!-- Section spécifique aux bailleurs -->
    <div class="space-y-6">
      <h3 class="text-lg font-medium text-gray-900">Informations pour les bailleurs</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Prix d'achat -->
        <div class="space-y-2">
          <label for="purchasePrice" class="block text-sm font-medium text-gray-700">
            Prix d'achat
          </label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              id="purchasePrice"
              v-model.number="formData.purchasePrice"
              type="number"
             
              class="block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
              placeholder="0,00"
            />
          </div>
        </div>

        <!-- Date d'achat -->
        <div class="space-y-2">
          <label for="purchaseDate" class="block text-sm font-medium text-gray-700">
            Date d'achat
          </label>
          <input
            id="purchaseDate"
            v-model="formData.purchaseDate"
            type="date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <!-- Notes pour le bailleur -->
      <div class="space-y-2">
        <label for="landlordNotes" class="block text-sm font-medium text-gray-700">
          Notes privées
        </label>
        <textarea
          id="landlordNotes"
          v-model="formData.landlordNotes"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Notes internes sur le bien..."
        ></textarea>
      </div>
    </div>
  </BasePropertyForm>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';
import propertyService from '@/services/property.service';
import BasePropertyForm from '@/components/shared/properties/BasePropertyForm.vue';
import type { Property } from '@/types/property';

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
      purchasePrice: null,
      purchaseDate: '',
      landlordNotes: '',
      equipments: []
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  submitButtonText: {
    type: String,
    default: 'Enregistrer'
  }
});

const emit = defineEmits({
  submit: (property: Property) => true,
  cancel: () => true,
  error: (error: Error) => true
});

// Données par défaut pour éviter les erreurs
const defaultProperty: Property = {
  id: '',
  name: '',
  type: '',
  status: 'Disponible',
  address: {
    street: '',
    postalCode: '',
    city: '',
    parcelNumber: ''
  },
  surface: 0,
  rooms: 1,
  floor: undefined,
  rent: 0,
  purchasePrice: undefined,
  purchaseDate: '',
  landlordNotes: '',
  equipments: [],
  ownerId: '',
  parcelNumber: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: '',
  updatedBy: ''
};

// Stores et utilitaires
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

// État de chargement
const isLoading = ref(false);
const error = ref<string | null>(null);
const validationErrors = ref<Record<string, string>>({});

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

const handleSubmit = async (formData) => {
  try {
    console.log('=== DÉBUT handleSubmit ===');
    console.log('Données du formulaire:', JSON.stringify(formData, null, 2));
    
    isLoading.value = true;
    error.value = null;
    
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    console.log('Token JWT présent:', !!token);
    console.log('Utilisateur connecté:', authStore.user);
    
    // Préparer les données pour l'API
    const propertyData = {
      ...formData,
      ownerId: authStore.user?.id, // Ajouter l'ID du propriétaire connecté
      status: formData.status || 'Disponible',
      // Convertir les objets d'adresse en format plat si nécessaire
      address: {
        street: formData.address?.street || '',
        postalCode: formData.address?.postalCode || '',
        city: formData.address?.city || '',
        country: formData.address?.country || 'France'
      },
      // S'assurer que les nombres sont bien des nombres
      surface: Number(formData.surface) || 0,
      rooms: Number(formData.rooms) || 1,
      floor: formData.floor ? Number(formData.floor) : undefined,
      rent: Number(formData.rent) || 0,
      charges: formData.charges ? Number(formData.charges) : 0,
      deposit: formData.deposit ? Number(formData.deposit) : undefined,
      // Gérer les équipements
      equipments: Array.isArray(formData.equipments) 
        ? formData.equipments.map(eq => typeof eq === 'string' ? eq : eq.id)
        : []
    };

    // Appeler le service approprié en fonction du mode (création ou édition)
    console.log('Tentative de création/mise à jour de la propriété...');
    console.log('URL de l\'API:', import.meta.env.VITE_API_URL || '/api');
    console.log('Données envoyées à l\'API:', JSON.stringify(propertyData, null, 2));
    
    let result: any; // Utilisation de 'any' pour éviter les problèmes de typage temporairement
    
    if (props.isEditing && props.property?.id) {
      // Mise à jour d'une propriété existante
      result = await propertyService.updateProperty(props.property.id, propertyData as PropertyUpdateData);
    } else {
      // Création d'une nouvelle propriété
      // Ajouter automatiquement l'ID du propriétaire connecté
      propertyData.ownerId = authStore.user?.id || '';
      result = await propertyService.createProperty(propertyData as PropertyCreateData);
    }
    
    console.log('Réponse de l\'API:', result);
    
    // Afficher un message de succès
    toast.success(
      props.isEditing 
        ? 'Propriété mise à jour avec succès' 
        : 'Propriété créée avec succès',
      { timeout: 3000 }
    );
    
    // Émettre l'événement de soumission avec les données de la propriété
    emit('submit', result);
    
    // Mettre à jour la propriété parente si nécessaire
    emit('update:property', result);
    
    // Rediriger vers la page de détail si c'est une nouvelle propriété
    if (!props.isEditing && result.id) {
      router.push(`/landlord/properties/${result.id}`);
    }
    
    return result;
  } catch (error: any) {
    console.error('Erreur lors de la soumission du formulaire:', error);
    
    // Gérer les erreurs de validation
    if (error.response?.data?.errors) {
      const validationErrors: Record<string, string> = {};
      Object.entries(error.response.data.errors).forEach(([field, messages]) => {
        validationErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
      });
      validationErrors.value = validationErrors;
      toast.error('Veuillez corriger les erreurs dans le formulaire', { timeout: 3000 });
    } else if (error.response?.status === 401) {
      // Ne rien faire ici, la gestion de la déconnexion est gérée par l'intercepteur
      console.warn('Erreur d\'authentification, déconnexion en cours...');
    } else {
      // Afficher un message d'erreur générique
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue lors de l\'enregistrement';
      toast.error(errorMessage, { timeout: 3000 });
      error.value = errorMessage;
      
      // Émettre l'événement d'erreur
      emit('error', new Error(errorMessage));
    }
  } finally {
    isLoading.value = false;
  }
};

// Charger les données initiales si en mode édition
onMounted(() => {
  if (props.isEditing && !props.property) {
    error.value = 'Impossible de charger les données de la propriété';
    toast.error('Impossible de charger les données de la propriété');
  }
});
</script>
