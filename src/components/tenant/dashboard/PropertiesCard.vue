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
                {{ property.contracts?.[0] ? formatContractPeriod(property.contracts[0]) : '-' }}
              </td>
              <td>
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                  :class="getStatusClass(property.contracts?.[0]?.status)"
                >
                  {{ getStatusLabel(property.contracts?.[0]?.status) || 'Inconnu' }}
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
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

// Interface pour les propriétés avec contrats
interface PropertyWithContracts extends BasePropertyData {
  contracts: Contract[];
}

const router = useRouter();
const authStore = useAuthStore();
const properties = ref<PropertyWithContracts[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

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
const formatContractPeriod = (contract: Contract): string => {
  if (!contract) return 'Non spécifié';
  
  const startDate = contract.start_date ? formatDate(contract.start_date) : 'Date inconnue';
  const endDate = contract.end_date ? `au ${formatDate(contract.end_date)}` : 'à durée indéterminée';
  
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
const getStatusLabel = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'Actif';
    case 'pending':
      return 'En attente';
    case 'ended':
      return 'Terminé';
    default:
      return 'Inconnu';
  }
};

// La fonction viewProperty est déjà définie plus haut

// Charger les propriétés du locataire
const loadProperties = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const user = authStore.user;
    console.log('User object from authStore:', JSON.stringify(user, null, 2));
    
    const userId = user?._id || (user as any)?.id;
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      console.error('Aucun ID utilisateur trouvé');
      throw new Error('Utilisateur non connecté');
    }
    
    // Récupérer les contrats du locataire avec les données de propriété incluses
    console.log(`Fetching contracts for tenantId: ${userId}`);
    const contractsResponse = await api.get(apiConfig.endpoints.contracts.byTenant(userId));
    console.log('Contracts API response:', contractsResponse);
    
    const contracts = contractsResponse.data?.data || [];
    console.log(`Found ${contracts.length} contracts`);
    
    // Créer un Map pour stocker les propriétés uniques
    const propertiesMap = new Map<number, PropertyWithContracts>();
    
    // Parcourir les contrats pour créer les propriétés
    contracts.forEach((contract: any) => {
      console.log('Contrat complet:', JSON.stringify(contract, null, 2));
      const propertyId = contract.property_id;
      
      // Vérifier si la propriété existe déjà dans le Map
      if (!propertiesMap.has(propertyId)) {
        // Créer une nouvelle propriété à partir des données du contrat
        const property: PropertyWithContracts = {
          id: propertyId,
          title: contract.property_title || `Propriété ${propertyId}`,
          address: {
            street: contract.property_address_street || '',
            city: contract.property_address_city || '',
            postal_code: contract.property_address_postal_code || '',
            country: contract.property_address_country || 'France'
          },
          // Utiliser property_type du contrat s'il existe, sinon utiliser 'appartement' par défaut
          type: contract.property_type || 'appartement',
          // Si property_type n'est pas défini, essayer de le déduire d'autres champs si nécessaire
          // Par exemple, si vous avez un champ property_category ou similaire
          area: contract.area || 0,
          rooms: contract.rooms || 0,
          bathrooms: contract.bathrooms || 0,
          furnished: Boolean(contract.furnished),
          status: contract.status || 'inconnu',
          rent: Number(contract.rent) || 0,
          charges: contract.charges !== undefined ? Number(contract.charges) : 0,
          deposit: contract.deposit !== undefined ? Number(contract.deposit) : 0,
          currency: contract.currency || 'EUR',
          contracts: [contract]
        };
        
        propertiesMap.set(propertyId, property);
      } else {
        // Ajouter le contrat à la propriété existante
        const existingProperty = propertiesMap.get(propertyId);
        if (existingProperty) {
          const contractExists = existingProperty.contracts.some((c: any) => c.id === contract.id);
          if (!contractExists) {
            existingProperty.contracts.push(contract);
          }
        }
      }
    });
    
    // Convertir le Map en tableau
    properties.value = Array.from(propertiesMap.values());
    console.log(`${properties.value.length} propriétés chargées à partir des contrats`);
  } catch (err) {
    console.error('Erreur lors du chargement des propriétés:', err);
    if (err instanceof Error) {
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
    }
    error.value = 'Impossible de charger les propriétés. Veuillez réessayer.';
  } finally {
    console.log('Finished loading properties');
    loading.value = false;
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
