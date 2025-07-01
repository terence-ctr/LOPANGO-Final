<template>
  <div class="bg-white rounded-xl shadow-md p-6 w-full">
    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex flex-col items-center">
        <div class="property-count">
          {{ properties.length }}
        </div>
        <div class="property-info">
          <p class="property-count-label">Les propriétés</p>
          <a href="#" class="view-all-link" @click="viewAllProperties">
            Tout voir <i class="fas fa-arrow-right text-xs"></i>
          </a>
        </div>
      </div>
      <div class="flex-1 overflow-x-auto">
        <div v-if="isLoading" class="p-4 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-sm text-gray-600">Chargement des propriétés...</p>
        </div>
        
        <div v-else-if="error" class="p-4 text-center text-red-600">
          <p>{{ error }}</p>
          <button 
            @click="fetchProperties" 
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
        
        <div v-else-if="properties.length === 0" class="p-4 text-center text-gray-500">
          <p>Aucune propriété trouvée</p>
        </div>
        
        <table v-else class="property-table text-xs w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom de la propriété</th>
              <th>Type</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(property, index) in properties.slice(0, 5)" :key="property.id" class="hover:bg-gray-50">
              <td class="font-medium">{{ (index + 1).toString().padStart(2, '0') }}</td>
              <td class="py-1.5 truncate max-w-[150px]" :title="property.title || 'Sans titre'">{{ property.title || 'Sans titre' }}</td>
              <td class="capitalize text-gray-600">{{ property.type ? property.type.toLowerCase() : '-' }}</td>
              <td>
                <span 
                  v-if="property.status"
                  :class="{
                    'px-2 py-0.5 text-[11px] font-medium rounded-full': true,
                    'bg-green-100 text-green-800': property.status === 'DISPONIBLE',
                    'bg-yellow-100 text-yellow-800': property.status === 'LOUE',
                    'bg-red-100 text-red-800': property.status === 'EN_MAINTENANCE' || property.status === 'EN_ENTRETIEN',
                    'bg-blue-100 text-blue-800': property.status === 'RESERVE' || property.status === 'EN_NEGOCIATION',
                    'bg-gray-100 text-gray-800': !property.status
                  }"
                >
                  {{ getStatusLabel(property.status) }}
                </span>
                <span v-else class="px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-100 text-gray-800">
                  {{ getStatusLabel(undefined) }}
                </span>
              </td>
              <td class="text-gray-400 text-center cursor-pointer">
                <i class="fas fa-ellipsis-h"></i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { apiConfig } from '@/config/api.config';
import type { Property, PropertyStatus } from '@/types/property';

const router = useRouter();
const properties = ref<Property[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const fetchProperties = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // Utiliser l'endpoint défini dans la configuration
    const response = await api.get(apiConfig.endpoints.properties.myProperties);
    
    // Vérifier si la réponse contient des données
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      properties.value = response.data.data;
    } else {
      throw new Error('Format de réponse inattendu du serveur');
    }
  } catch (err: unknown) {
    console.error('Erreur lors du chargement des propriétés:', err);
    error.value = 'Impossible de charger les propriétés. Veuillez réessayer plus tard.';
    
    // Afficher un message d'erreur plus détaillé en mode développement
    if (import.meta.env.DEV) {
      console.error('Détails de l\'erreur:', err);
    }
  } finally {
    isLoading.value = false;
  }
};

// Appeler fetchProperties au chargement du composant
onMounted(() => {
  fetchProperties();
});

const viewAllProperties = () => {
  router.push('/landlord/properties');
};

// Function to get status label
const getStatusLabel = (status?: PropertyStatus): string => {
  if (!status) return 'Inconnu';
  const statusMap: Record<PropertyStatus, string> = {
    'DISPONIBLE': 'Disponible',
    'LOUE': 'Loué',
    'RESERVE': 'Réservé',
    'EN_NEGOCIATION': 'En négociation',
    'EN_MAINTENANCE': 'En maintenance',
    'EN_ENTRETIEN': 'En entretien',
    'INDISPONIBLE': 'Indisponible',
    'VENDU': 'Vendu'
  };
  return statusMap[status] || status;
};

// Propriété calculée pour les propriétés actives (louées ou en cours de négociation)
const activeProperties = computed(() => {
  return properties.value.filter((p: Property) => p.status === 'LOUE' || p.status === 'EN_NEGOCIATION').length;
});
</script>

<style scoped>
.property-table {
  width: 100%;
  border-collapse: collapse;
}

.property-table th,
.property-table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.property-table th {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem;
}

.property-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.status-active {
  color: #059669;
  font-weight: 600;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.view-all-link:hover {
  text-decoration: underline;
}

.property-count {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background-color: #1d4ed8;
  border-radius: 0.5rem;
  color: white;
  font-weight: 800;
  font-size: 1.875rem;
  line-height: 1;
}

.property-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 5rem;
  margin-top: 0.5rem;
}

.property-count-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.first {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji';
}
</style>