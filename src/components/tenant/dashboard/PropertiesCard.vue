<template>
  <div class="bg-white rounded-xl shadow-md p-6 w-full">
    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex flex-col items-center">
        <div class="property-count">
          {{ properties.length }}
        </div>
        <div class="property-info">
          <p class="property-count-label">Mes propriétés</p>
          <router-link to="/tenant/properties" class="view-all-link">
            Tout voir <i class="fas fa-arrow-right text-xs"></i>
          </router-link>
        </div>
      </div>
      <div class="flex-1 overflow-x-auto">
        <div v-if="loading" class="p-4 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-sm text-gray-600">Chargement des propriétés...</p>
        </div>
        
        <div v-else-if="error" class="p-4 text-center text-red-600">
          <p>{{ error }}</p>
          <button 
            @click="loadProperties" 
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            Réessayer
          </button>
        </div>
        
        <div v-else-if="!properties.length" class="p-4 text-center text-gray-500">
          <p>Aucune propriété en location trouvée</p>
        </div>
        
        <table v-else class="property-table text-xs w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Propriété</th>
              <th>Adresse</th>
              <th>Période</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(property, index) in properties.slice(0, 5)" 
              :key="property.id"
              @click="viewContract(property.contracts?.[0]?.id || 0)"
              class="hover:bg-gray-50 cursor-pointer"
            >
              <td class="font-medium">{{ (index + 1).toString().padStart(2, '0') }}</td>
              <td class="py-1.5">
                <div class="font-medium text-gray-900">{{ property.title || 'Sans titre' }}</div>
                <div class="text-gray-500 text-xs">
                  {{ property.type ? propertyTypeLabels[property.type] || property.type : 'Non spécifié' }}
                </div>
              </td>
              <td class="text-gray-600">{{ formatAddress(property.address) }}</td>
              <td class="text-gray-600">
                {{ formatContractPeriod(property) }}
              </td>
              <td>
                <template v-if="property.contractStatus">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                    :class="getStatusClass(property.contractStatus)"
                  >
                    {{ getStatusLabel(property.contractStatus) }}
                  </span>
                </template>
                <template v-else-if="property.status">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                    :class="getStatusClass(property.status)"
                  >
                    {{ getStatusLabel(property.status) }}
                  </span>
                </template>
                <span 
                  v-else
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-800"
                >
                  Aucun statut
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePropertyStore } from '@/stores/propertyStore';
import api from '@/services/api';
import { apiConfig } from '@/config/api.config';
import type { Property } from '@/types/property';
import type { Contract } from '@/types/contract';

// Libellés pour les types de propriétés
const propertyTypeLabels: Record<string, string> = {
  'APPARTEMENT': 'Appartement',
  'MAISON': 'Maison',
  'VILLA': 'Villa',
  'CHATEAU': 'Château',
  'PARKING': 'Parking',
  'LOCAL_COMMERCIAL': 'Local commercial',
  'BUREAU': 'Bureau',
  'ENTREPOT': 'Entrepôt',
  'TERRAIN': 'Terrain',
  'AUTRE': 'Autre'
};

// Interface pour les propriétés étendues avec contrats
// Type pour les données de propriété de base
interface BasePropertyData {
  id: string | number;
  title: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  type: string;
  area: number;
  rooms: number;
  bathrooms: number;
  furnished: boolean;
  status: string;
  rent: number;
  charges: number;
  deposit: number;
  currency: string;
  [key: string]: any;
}

// Interface pour les propriétés du locataire
interface TenantProperty {
  id: string | number;
  _id?: string;
  title: string;
  name?: string;
  description?: string;
  slug?: string;
  address: string | {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  type?: string;
  rent?: number;
  deposit?: number;
  currency?: string;
  status?: string;
  contractId?: string | number;
  contractStartDate?: string | Date;
  contractEndDate?: string | Date;
  contractStatus?: string;
  contract?: Contract;
  contracts?: Contract[];
  [key: string]: any; // Pour les autres propriétés optionnelles
}

const router = useRouter();
const authStore = useAuthStore();
const propertyStore = usePropertyStore();
const properties = computed<TenantProperty[]>(() => {
  const props = (propertyStore.getTenantProperties || []) as TenantProperty[];
  console.log('Propriétés dans le computed:', props);
  
  return props.map(prop => {
    console.log('Propriété:', {
      id: prop.id,
      title: prop.title,
      contractStatus: prop.contractStatus,
      status: prop.status,
      contract: prop.contract,
      allProps: Object.keys(prop)
    });
    
    return {
      ...prop,
      // S'assurer que contractStatus est défini
      contractStatus: prop.contractStatus || prop.status || 'unknown',
      // S'assurer que les contrats sont un tableau
      contracts: Array.isArray(prop.contracts) ? prop.contracts : (prop.contract ? [prop.contract] : [])
    } as TenantProperty;
  });
});
const loading = computed(() => propertyStore.isLoading);
const error = computed(() => propertyStore.propertyError);

// Formater une adresse
const formatAddress = (address: string | { street?: string; city?: string; postal_code?: string; country?: string } | null | undefined): string => {
  if (!address) return 'Adresse non disponible';
  
  if (typeof address === 'string') {
    return address;
  }
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.postal_code) parts.push(address.postal_code);
  if (address.city) parts.push(address.city);
  if (address.country) parts.push(address.country);
  
  return parts.length > 0 ? parts.join(', ') : 'Adresse non disponible';
};

// Formater une date
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date invalide' : date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric' 
    });
  } catch (e) {
    return 'Date invalide';
  }
};

// Formater la période du contrat
const formatContractPeriod = (property: any): string => {
  if (!property) return '-';
  
  const startDate = property.contractStartDate ? formatDate(property.contractStartDate) : 'Date inconnue';
  const endDate = property.contractEndDate ? `au ${formatDate(property.contractEndDate)}` : 'à durée indéterminée';
  
  return `Du ${startDate} ${endDate}`;
};

// Fonction pour naviguer vers la page de détail d'une propriété
const viewProperty = (propertyId: string | number) => {
  router.push(`/properties/${propertyId}`);
};

// Fonction pour naviguer vers la page de détail d'un contrat
const viewContract = (contractId: string | number) => {
  router.push(`/tenant/contracts/${contractId}`);
};

// Obtenir la classe CSS en fonction du statut
const getStatusClass = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'ended':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Obtenir le libellé du statut
const getStatusLabel = (status: any): string => {
  console.log('getStatusLabel appelé avec:', status);
  
  if (!status) {
    console.log('Aucun statut fourni');
    return 'Inconnu (vide)';
  }
  
  // Si c'est un objet, essayer d'en extraire le statut
  if (typeof status === 'object') {
    console.log('Statut est un objet, tentative d\'extraction:', status);
    return getStatusLabel(status.status || status.etat || status.state || status.name || status.value);
  }
  
  const statusStr = String(status).toLowerCase().trim();
  console.log('Statut normalisé:', statusStr);
  
  const statusMap: Record<string, string> = {
    'active': 'Actif',
    'actif': 'Actif',
    'en cours': 'Actif',
    'pending': 'En attente',
    'en attente': 'En attente',
    'waiting': 'En attente',
    'ended': 'Terminé',
    'terminé': 'Terminé',
    'termine': 'Terminé',
    'expiré': 'Expiré',
    'expire': 'Expiré',
    'cancelled': 'Annulé',
    'annulé': 'Annulé',
    'canceled': 'Annulé',
    'annule': 'Annulé'
  };
  
  const label = statusMap[statusStr] || ` ${status}`;
  console.log('Libellé du statut:', label);
  return label;
};

// Charger les propriétés du locataire
const loadProperties = async () => {
  try {
    console.log('Début du chargement des propriétés...');
    await propertyStore.fetchTenantProperties();
    
    // Afficher les propriétés chargées pour le débogage
    const tenantProps = propertyStore.getTenantProperties || [];
    console.log(`Nombre de propriétés chargées: ${tenantProps.length}`);
    
    if (tenantProps.length > 0) {
      console.log('=== Détails des propriétés ===');
      tenantProps.forEach((prop: any, index: number) => {
        console.log(`--- Propriété #${index + 1} ---`);
        console.log('Titre:', prop.title);
        console.log('ID:', prop.id || prop._id);
        console.log('Type:', prop.type);
        console.log('Adresse:', prop.address);
        console.log('Statut:', prop.status);
        console.log('Contract Status:', prop.contractStatus);
        console.log('Contract ID:', prop.contractId);
        console.log('Toutes les propriétés:', Object.keys(prop));
        
        // Si la propriété a un contrat, afficher ses détails
        if (prop.contract) {
          console.log('Détails du contrat:', prop.contract);
        }
        if (prop.contracts && prop.contracts.length > 0) {
          console.log('Contrats associés:', prop.contracts);
        }
      });
      console.log('=== Fin des détails ===');
    }
  } catch (err) {
    console.error('Erreur lors du chargement des propriétés:', err);
    if (err instanceof Error) {
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
    }
    // L'erreur est déjà gérée dans le store, pas besoin de la redéfinir ici
  }
};

// Charger les propriétés au montage du composant
onMounted(() => {
  loadProperties();
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

/* Classes de statut */
.bg-green-100 { background-color: #dcfce7; }
.text-green-800 { color: #166534; }
.bg-yellow-100 { background-color: #fef9c3; }
.text-yellow-800 { color: #854d0e; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-800 { color: #991b1b; }
.bg-blue-100 { background-color: #dbeafe; }
.text-blue-800 { color: #1e40af; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-gray-800 { color: #1f2937; }
</style>
