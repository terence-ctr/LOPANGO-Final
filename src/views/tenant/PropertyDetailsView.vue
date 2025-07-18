<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm text-red-700 mb-3">
            {{ error }}
          </p>
          <div class="flex space-x-3">
            <button
              @click="router.push({ name: 'tenant-properties' })"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            {{ property?.title || 'Chargement...' }}
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            {{ property?.address || 'Adresse non spécifiée' }}
          </p>
        </div>
        <div class="flex space-x-2">
          <router-link 
            :to="{ name: 'tenant-properties' }" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Retour
          </router-link>
        </div>
      </div>

      <div class="px-4 py-5 sm:px-6">
        <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Type de bien</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.type || 'Non spécifié' }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Statut</dt>
            <dd class="mt-1 text-sm">
              <span :class="statusClass">{{ getStatusLabel(property?.status) }}</span>
            </dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Disponible à partir du</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(property?.available_from) }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Surface</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.area || 0 }} m²</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Pièces</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.rooms || 0 }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Salles de bain</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.bathrooms || 0 }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Étage</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.floor || 'Rez-de-chaussée' }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Année de construction</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.year_built || 'Non spécifiée' }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Meublé</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.furnished ? 'Oui' : 'Non' }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Climatisation</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.has_air_conditioning ? 'Oui' : 'Non' }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Balcon</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.has_balcony ? 'Oui' : 'Non' }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Ascenseur</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.has_elevator ? 'Oui' : 'Non' }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Jardin</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.has_garden ? 'Oui' : 'Non' }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Chauffage</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.has_heating ? 'Oui' : 'Non' }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Parking</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.has_parking ? 'Oui' : 'Non' }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Piscine</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.has_pool ? 'Oui' : 'Non' }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Terrasse</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.has_terrace ? 'Oui' : 'Non' }}</dd>
          </div>
          
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Loyer mensuel</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(property?.rent) }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Charges mensuelles</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(property?.charges) }}</dd>
          </div>

          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Dépôt de garantie</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(property?.deposit) }}</dd>
          </div>

          <div class="sm:col-span-2">
            <dt class="text-sm font-medium text-gray-500">Adresse</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property?.address || 'Non spécifiée' }}</dd>
          </div>

          <div class="sm:col-span-2">
            <dt class="text-sm font-medium text-gray-500">Description</dt>
            <dd class="mt-1 text-sm text-gray-900 whitespace-pre-line">
              {{ property?.description || 'Aucune description fournie' }}
            </dd>
          </div>

          <div v-if="property?.equipment && property.equipment.length > 0" class="sm:col-span-2">
            <dt class="text-sm font-medium text-gray-500">Équipements</dt>
            <dd class="mt-1 text-sm text-gray-900">
              <ul class="list-disc list-inside">
                <li v-for="(equipment, index) in property.equipment" :key="index">
                  {{ getEquipmentLabel(equipment) }}
                </li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>

      <!-- Historique des paiements -->
      <section class="flex-1 min-w-0">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-sm">
            Historique de paiement
          </h3>
        </div>

        <div v-if="payments.length > 0" class="overflow-x-auto border border-gray-300 rounded-lg">
          <table class="w-full text-xs text-left text-gray-900 border-collapse">
            <thead class="bg-white border-b border-gray-300">
              <tr>
                <th class="py-2 px-3 border-r border-gray-300 font-semibold">
                  Mois
                </th>
                <th class="py-2 px-3 border-r border-gray-300 font-semibold">
                  Montant
                </th>
                <th class="py-2 px-3 border-r border-gray-300 font-semibold">
                  A utilisé sa garantie ?
                </th>
                <th class="py-2 px-3 border-r border-gray-300 font-semibold">
                  Locataire
                </th>
                <th class="py-2 px-3 font-semibold">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(payment, index) in payments" :key="index" class="border-b border-gray-200">
                <td class="py-2 px-3 border-r border-gray-300">
                  {{ formatDate(payment.date) }}
                </td>
                <td class="py-2 px-3 border-r border-gray-300">
                  {{ formatCurrency(payment.amount) }}
                </td>
                <td class="py-2 px-3 border-r border-gray-300">
                  {{ payment.usedDeposit ? 'Oui' : 'Non' }}
                </td>
                <td class="py-2 px-3 border-r border-gray-300 font-semibold">
                  {{ payment.tenantName || 'N/A' }}
                </td>
                <td class="py-2 px-3">
                  {{ formatDate(payment.date, 'full') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          Aucun paiement enregistré pour cette propriété
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import PropertyService from '@/services/property.service';
import { Property } from '@/types/property';

// Define interfaces
interface Payment {
  id: number;
  date: string;
  amount: number;
  usedDeposit: boolean;
  tenantName: string;
}

// Setup refs
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref('');
const property = ref<Property | null>(null);
const payments = ref<Payment[]>([]);

// Get toast instance
const toast = useToast();

// Helper functions
const formatDate = (timestamp: number | string | Date | undefined | null, format: 'short' | 'full' = 'short'): string => {
  if (!timestamp) return 'Non spécifiée';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Date invalide';

    const options: Intl.DateTimeFormatOptions =
      format === 'full'
        ? {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }
        : {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          };

    return date.toLocaleString('fr-FR', options);
  } catch (e) {
    console.error(`Erreur de format de date pour la valeur: ${timestamp}`, e);
    return 'Date invalide';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return '0,00 €';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return 'Montant invalide';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: property.value?.currency || 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

const getEquipmentLabel = (equipmentValue: string): string => {
  const equipmentLabels: { [key: string]: string } = {
    'wifi': 'WiFi',
    'parking': 'Parking',
    'balcon': 'Balcon',
    'terrasse': 'Terrasse',
    'piscine': 'Piscine',
    'jardin': 'Jardin',
    'cave': 'Cave',
    'meuble': 'Meublé',
    'lave-linge': 'Lave-linge',
    'lave-vaisselle': 'Lave-vaisselle',
    'cuisine': 'Cuisine équipée'
  };
  return equipmentLabels[equipmentValue] || equipmentValue;
};

const getStatusLabel = (status: string | undefined): string => {
  const statusLabels: { [key: string]: string } = {
    'disponible': 'Disponible',
    'loue': 'Loué',
    'en_maintenance': 'En maintenance',
    'bientot_disponible': 'Bientôt disponible'
  };

  if (typeof status === 'string') {
    return statusLabels[status.toLowerCase()] || status;
  }
  
  return 'Statut inconnu';
};

// Options
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

// Computed


const statusClass = computed(() => {
  const status = (property.value?.status || '').toLowerCase();
  switch (status) {
    case 'disponible':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
    case 'loue':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
    case 'en_maintenance':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
    case 'bientot_disponible':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800';
    default:
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
  }
});

// Methods
// Data fetching
const fetchProperty = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // Vérifier si l'utilisateur est connecté
    if (!authStore.isAuthenticated) {
      error.value = 'Vous devez être connecté pour voir les détails de cette propriété';
      toast.error('Veuillez vous connecter');
      router.push({ name: 'login' });
      return;
    }
    
    const propertyId = parseInt(route.params.id as string);
    
    // Vérifier que l'ID est valide
    if (isNaN(propertyId) || propertyId <= 0) {
      error.value = 'ID de propriété invalide';
      toast.error('ID de propriété invalide');
      return;
    }
    
    console.log(`Récupération de la propriété ID: ${propertyId}`);
    
    // Utiliser getById avec l'ID de locataire si c'est un locataire
    const tenantId = authStore.user?.userType === 'tenant' ? String(authStore.user.id) : undefined;
    
    try {
      property.value = await PropertyService.getById(propertyId, tenantId);
      console.log('Propriété récupérée:', property.value);
    } catch (err) {
      // Gérer spécifiquement l'erreur si l'utilisateur n'est pas défini
      if (!authStore.user) {
        error.value = 'Utilisateur non défini. Veuillez vous reconnecter.';
        toast.error('Session invalide');
        authStore.logout();
        router.push({ name: 'login' });
        return;
      }
      throw err;
    }
    console.log('Propriété récupérée:', property.value);
  } catch (err: any) {
    console.error('Erreur lors de la récupération des données:', err);
    
    if (err.response?.status === 403) {
      error.value = 'Vous n\'êtes pas autorisé à accéder à cette propriété.';
      toast.error('Accès refusé à cette propriété');
    } else if (err.response?.status === 401) {
      error.value = 'Votre session a expiré. Veuillez vous reconnecter.';
      toast.error('Session expirée');
      authStore.logout();
      router.push({ name: 'login' });
    } else if (err.response?.status === 404) {
      error.value = 'Cette propriété n\'existe pas ou a été supprimée.';
      toast.error('Propriété non trouvée');
    } else {
      error.value = err.message || 'Une erreur est survenue lors du chargement des détails';
      toast.error('Impossible de charger les détails de la propriété');
    }
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  await fetchProperty();
});

// Component name for debugging
const componentName = 'PropertyDetailsView';
</script>
