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
        <div class="ml-3">
          <p class="text-sm text-red-700">
            {{ error }}
          </p>
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
            {{ property?.address || '' }}
          </p>
        </div>
        <div class="flex space-x-2">
          <router-link 
            :to="{ name: 'landlord-properties' }" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Retour
          </router-link>
          <router-link 
            :to="{ name: 'landlord-property-edit', params: { id: property?.id } }" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Modifier
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
            <dd class="mt-1 text-sm text-gray-900">
              <span :class="statusBadgeClass">
                {{ property.status }}
              </span>
            </dd>
          </div>
          
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Surface</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property.area }} m²</dd>
          </div>
          
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Pièces</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property.rooms }}</dd>
          </div>
          
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Salles de bain</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property.bathrooms }}</dd>
          </div>
          
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Étage</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ property.floor || 'Rez-de-chaussée' }}</dd>
          </div>
          
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Loyer</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ property.rent }} {{ property.currency }}
              <span v-if="property.charges > 0" class="text-gray-500"> + {{ property.charges }} {{ property.currency }} de charges</span>
            </dd>
          </div>
          
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Disponible à partir du</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ formatDate(property.available_from) }}
            </dd>
          </div>
          
          <div class="sm:col-span-2">
            <dt class="text-sm font-medium text-gray-500">Description</dt>
            <dd class="mt-1 text-sm text-gray-900 whitespace-pre-line">
              {{ property.description || 'Aucune description fournie' }}
            </dd>
          </div>
          
          <div v-if="property.equipment && property.equipment.length > 0" class="sm:col-span-2">
            <dt class="text-sm font-medium text-gray-500">Équipements</dt>
            <dd class="mt-1 text-sm text-gray-900">
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
          <div class="flex space-x-2">
            <button 
              @click="deleteProperty"
              class="bg-red-400 text-white text-xs font-semibold rounded px-3 py-1.5 hover:bg-red-500 transition" 
              type="button"
            >
              Supprimer
            </button>
            <button 
              @click="editProperty"
              class="bg-[#004a9f] text-white text-xs font-semibold rounded px-3 py-1.5 hover:bg-blue-800 transition" 
              type="button"
            >
              Éditer
            </button>
          </div>
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
                  {{ formatDate(payment.date, 'MMMM yyyy') }}
                </td>
                <td class="py-2 px-3 border-r border-gray-300">
                  {{ payment.amount }} {{ property.currency || '€' }}
                </td>
                <td class="py-2 px-3 border-r border-gray-300">
                  {{ payment.usedDeposit ? 'Oui' : 'Non' }}
                </td>
                <td class="py-2 px-3 border-r border-gray-300 font-semibold">
                  {{ payment.tenantName || 'N/A' }}
                </td>
                <td class="py-2 px-3">
                  {{ formatDate(payment.date, 'dd MMMM yyyy') }}
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

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import PropertyService from '@/services/PropertyService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default defineComponent({
  name: 'PropertyDetailsView',
  
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const loading = ref(true);
    const error = ref('');
    
    const property = ref({
      id: 0,
      owner_id: 0,
      tenant_id: null,
      title: '',
      description: '',
      type: '',
      status: 'BROUILLON',
      address: '',
      city: '',
      postal_code: '',
      country: 'France',
      area: 0,
      land_area: 0,
      rooms: 0,
      bathrooms: 0,
      floor: 0,
      furnished: false,
      equipment: [] as string[],
      has_elevator: false,
      has_parking: false,
      has_balcony: false,
      has_terrace: false,
      has_garden: false,
      has_pool: false,
      has_air_conditioning: false,
      has_heating: false,
      rent: 0,
      charges: 0,
      deposit: 0,
      currency: 'EUR',
      year_built: new Date().getFullYear(),
      is_active: true,
      is_featured: false,
      available_from: new Date().toISOString(),
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Options pour les listes déroulantes
    const propertyTypes = [
      { value: 'appartement', label: 'Appartement' },
      { value: 'maison', label: 'Maison' },
      { value: 'bureau', label: 'Bureau' },
      { value: 'local', label: 'Local commercial' },
      { value: 'autre', label: 'Autre' }
    ];

    const statusOptions = [
      { value: 'disponible', label: 'Disponible' },
      { value: 'loue', label: 'Loué' },
      { value: 'en_maintenance', label: 'En maintenance' },
      { value: 'bientot_disponible', label: 'Bientôt disponible' },
      { value: 'inactif', label: 'Inactif' }
    ];

    const equipmentOptions = [
      { value: 'frigo', label: 'Réfrigérateur' },
      { value: 'lave_vaisselle', label: 'Lave-vaisselle' },
      { value: 'lave_linge', label: 'Lave-linge' },
      { value: 'seche_linge', label: 'Sèche-linge' },
      { value: 'micro_ondes', label: 'Four à micro-ondes' },
      { value: 'four', label: 'Four' },
      { value: 'plaques_cuisson', label: 'Plaques de cuisson' },
      { value: 'cafetiere', label: 'Machine à café' },
      { value: 'congelateur', label: 'Congélateur' },
      { value: 'climatisation', label: 'Climatisation' },
      { value: 'chauffage', label: 'Chauffage' },
      { value: 'ascenseur', label: 'Ascenseur' },
      { value: 'parking', label: 'Parking' },
      { value: 'balcon', label: 'Balcon' },
      { value: 'terrasse', label: 'Terrasse' },
      { value: 'jardin', label: 'Jardin' },
      { value: 'piscine', label: 'Piscine' },
      { value: 'meuble', label: 'Meublé' },
      { value: 'wifi', label: 'Wi-Fi' },
      { value: 'television', label: 'Télévision' },
      { value: 'lave_vaisselle', label: 'Lave-vaisselle' },
      { value: 'seche_linge', label: 'Sèche-linge' },
      { value: 'interphone', label: 'Interphone' },
      { value: 'digicode', label: 'Digicode' },
      { value: 'gardien', label: 'Gardien' },
      { value: 'alarme', label: 'Alarme' },
      { value: 'double_vitrage', label: 'Double vitrage' },
      { value: 'volets_roulants', label: 'Volets roulants' },
      { value: 'cheminee', label: 'Cheminée' },
      { value: 'cave', label: 'Cave' },
      { value: 'grenier', label: 'Grenier' },
      { value: 'buanderie', label: 'Buanderie' },
      { value: 'penderie', label: 'Penderie' },
      { value: 'local_velo', label: 'Local à vélos' },
      { value: 'local_skis', label: 'Local à skis' },
      { value: 'piscine_commune', label: 'Piscine commune' },
      { value: 'tennis', label: 'Court de tennis' },
      { value: 'salle_sport', label: 'Salle de sport' },
      { value: 'sauna', label: 'Sauna' },
      { value: 'jacuzzi', label: 'Jacuzzi' },
      { value: 'hammam', label: 'Hammam' },
      { value: 'solarium', label: 'Solarium' },
      { value: 'terrasse_commune', label: 'Terrasse commune' },
      { value: 'jardin_commun', label: 'Jardin commun' },
      { value: 'piscine_commune', label: 'Piscine commune' },
      { value: 'espace_jeux', label: 'Espace jeux' },
      { value: 'espace_detente', label: 'Espace détente' },
      { value: 'espace_coworking', label: 'Espace coworking' },
      { value: 'espace_repas', label: 'Espace repas' },
      { value: 'espace_enfants', label: 'Espace enfants' },
      { value: 'espace_barbecue', label: 'Espace barbecue' },
      { value: 'espace_vert', label: 'Espace vert' },
      { value: 'espace_petit_dejeuner', label: 'Espace petit-déjeuner' },
      { value: 'espace_reception', label: 'Espace réception' },
      { value: 'espace_securise', label: 'Espace sécurisé' },
      { value: 'espace_stationnement', label: 'Espace stationnement' },
      { value: 'espace_velo', label: 'Espace vélos' },
      { value: 'espace_moto', label: 'Espace motos' },
      { value: 'espace_voiture', label: 'Espace voitures' },
      { value: 'espace_camping_car', label: 'Espace camping-car' },
      { value: 'espace_caravane', label: 'Espace caravane' },
      { value: 'espace_bateau', label: 'Espace bateau' },
      { value: 'espace_avion', label: 'Espace avion' },
      { value: 'espace_helicoptere', label: 'Espace hélicoptère' },
      { value: 'espace_fusee', label: 'Espace fusée' }
    ];

    // Classes CSS pour les badges de statut (version détaillée avec plus de styles)
    const statusBadgeClass = computed(() => {
      const status = property.value.status?.toLowerCase();
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

    // Formater une date en français
    const formatDate = (dateString: string | null | undefined): string => {
      if (!dateString) return 'Non spécifié';
      
      try {
        const options: Intl.DateTimeFormatOptions = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          timeZone: 'UTC'
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
      } catch (error) {
        console.error('Erreur de format de date:', error);
        return 'Date invalide';
      }
    };

    // Formater un montant avec le symbole de la devise
    const formatCurrency = (amount: number | string | null | undefined): string => {
      if (amount === null || amount === undefined) return '0,00 €';
      
      // Convertir en nombre si c'est une chaîne
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      // Vérifier si le montant est un nombre valide
      if (isNaN(numAmount)) return 'Montant invalide';
      
      // Formater le montant avec 2 décimales et le symbole €
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: property.value.currency || 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numAmount);
    };

    // Obtenir le libellé d'un équipement à partir de sa valeur
    const getEquipmentLabel = (equipmentValue: string): string => {
      const found = equipmentOptions.find(item => item.value === equipmentValue);
      return found ? found.label : equipmentValue;
    };

    // Obtenir le libellé d'un statut
    const getStatusLabel = (statusValue: string): string => {
      const found = statusOptions.find(item => item.value === statusValue);
      return found ? found.label : statusValue;
    };

    // Charger les données de la propriété
    const fetchProperty = async () => {
      try {
        loading.value = true;
        error.value = '';
        
        const propertyId = route.params.id;
        if (!propertyId) {
          throw new Error('ID de propriété manquant dans l\'URL');
        }
        
        console.log(`Chargement de la propriété avec l'ID:`, propertyId);
        
        // Appeler le service pour récupérer la propriété
        const response = await PropertyService.getById(Number(propertyId));
        console.log('Réponse du service:', response);
        
        if (!response) {
          throw new Error('Aucune donnée reçue pour cette propriété');
        }
        
        // Mettre à jour les données de la propriété
        property.value = {
          ...property.value, // Garder les valeurs par défaut
          ...response,      // Écraser avec les données du serveur
          // S'assurer que equipment est toujours un tableau
          equipment: Array.isArray(response.equipment) 
            ? response.equipment 
            : (response.equipment ? [response.equipment] : [])
        };
        
        console.log('Propriété chargée:', property.value);
        
      } catch (err: any) {
        console.error('Erreur lors du chargement de la propriété:', err);
        
        // Déterminer le message d'erreur approprié
        if (err.response) {
          if (err.response.status === 404) {
            error.value = 'La propriété demandée est introuvable';
          } else if (err.response.status === 401) {
            error.value = 'Vous devez être connecté pour voir cette propriété';
            // Rediriger vers la page de connexion après un délai
            setTimeout(() => {
              router.push({ name: 'login' });
            }, 2000);
          } else {
            error.value = `Erreur serveur (${err.response.status}): ${err.response.data?.message || 'Veuillez réessayer plus tard'}`;
          }
        } else if (err.request) {
          error.value = 'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
        } else {
          error.value = err.message || 'Une erreur inattendue est survenue';
        }
        
        // Afficher une notification d'erreur
        toast.error(error.value, { timeout: 5000 });
        
      } finally {
        loading.value = false;
      }
    };

    // Gérer la suppression d'une propriété
    const handleDelete = async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible.')) {
        return;
      }
      
      try {
        loading.value = true;
        await PropertyService.deleteProperty(property.value.id);
        
        // Afficher un message de succès
        toast.success('La propriété a été supprimée avec succès');
        
        // Rediriger vers la liste des propriétés après un court délai
        setTimeout(() => {
          router.push({ name: 'landlord-properties' });
        }, 1000);
        
      } catch (err: any) {
        console.error('Erreur lors de la suppression de la propriété:', err);
        
        let errorMessage = 'Erreur lors de la suppression de la propriété';
        if (err.response) {
          if (err.response.status === 403) {
            errorMessage = 'Vous n\'êtes pas autorisé à supprimer cette propriété';
          } else if (err.response.status === 404) {
            errorMessage = 'La propriété à supprimer est introuvable';
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        }
        
        toast.error(errorMessage, { timeout: 5000 });
      } finally {
        loading.value = false;
      }
    };

    // Gérer la navigation arrière/avant du navigateur
    const handlePopState = () => {
      fetchProperty();
    };

    // Charger les données au montage du composant
    onMounted(() => {
      fetchProperty();
      window.addEventListener('popstate', handlePopState);
    });
    
    // Nettoyage des écouteurs d'événements
    const onUnmounted = (fn: () => void) => {
      onMounted(() => () => fn());
    };
    
    onUnmounted(() => {
      window.removeEventListener('popstate', handlePopState);
    });

    // Réagir aux changements de l'ID dans l'URL
    const watch = (source: () => any, cb: (newVal: any, oldVal: any) => void) => {
      onMounted(() => {
        const unwatch = (router as any).afterEach((to: any, from: any) => {
          if (to.params.id !== from.params.id) {
            cb(to.params.id, from.params.id);
          }
        });
        return unwatch;
      });
    };
    
    watch(() => route.params.id, (newId, oldId) => {
      if (newId && newId !== oldId) {
        fetchProperty();
      }
    });
    

    

    

    

    


    // Exposer les données et méthodes au template
    return {
      // État
      loading,
      error,
      property,
      
      // Données
      propertyTypes,
      statusOptions,
      equipmentOptions,
      
      // Méthodes
      fetchProperty,
      handleDelete,
      formatDate,
      formatCurrency,
      getEquipmentLabel,
      getStatusLabel,
      
      // Computed
      statusBadgeClass
    };
  }
});
</script>
