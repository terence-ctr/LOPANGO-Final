<template>
  <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
    <!-- En-tête du calendrier -->
    <div class="flex justify-between items-center mb-4">
      <button 
        @click="previousMonth"
        class="p-1 text-gray-600 hover:text-blue-700 rounded-full hover:bg-gray-100"
        aria-label="Mois précédent"
      >
        <i class="fas fa-chevron-left text-sm"></i>
      </button>
      
      <div class="text-sm font-semibold text-gray-700">
        {{ currentMonth }} {{ currentYear }}
      </div>
      
      <button 
        @click="nextMonth"
        class="p-1 text-gray-600 hover:text-blue-700 rounded-full hover:bg-gray-100"
        aria-label="Mois suivant"
      >
        <i class="fas fa-chevron-right text-sm"></i>
      </button>
    </div>
    
    <!-- Jours de la semaine -->
    <div class="grid grid-cols-7 text-center text-xs text-gray-500 font-medium mb-2">
      <div v-for="day in days" :key="day" class="py-1">
        {{ day }}
      </div>
    </div>
    
    <!-- État de chargement et erreur -->
    <div v-if="isLoading" class="py-4 text-center text-gray-500">
      Chargement des contrats...
    </div>
    <div v-else-if="error" class="py-4 text-center text-red-500">
      {{ error }}
    </div>
    
    <!-- Jours du mois -->
    <div class="grid grid-cols-7 gap-1 text-xs" :class="{ 'opacity-50': isLoading }">
      <div 
        v-for="(day, index) in calendarDays" 
        :key="index"
        class="h-8 p-1 border border-none overflow-hidden relative"
        :class="{
          'bg-gray-50': !isCurrentMonth(day.date),
          'cursor-pointer': isContractStartOrEndDate(day.date),
          'hover:bg-blue-50': isContractStartOrEndDate(day.date)
        }"
        @click="isContractStartOrEndDate(day.date) ? handleDayClick(day.date) : null"
        @mouseover="handleMouseOver(day, $event)"
        @mouseleave="handleMouseLeave"
      >
        <!-- Jour du mois -->
        <span 
          class="relative z-10 flex items-center justify-center w-6 h-6 rounded-full"
          :class="{
            'text-gray-400': !isCurrentMonth(day.date),
            'bg-blue-600 text-white': day.isToday,
            'text-green-600': isStartOfContract(day.date) && !day.isToday,
            'text-red-600': isEndOfContract(day.date) && !day.isToday,
            'font-medium': day.isToday || isStartOfContract(day.date) || isEndOfContract(day.date)
          }"
        >
          {{ day.day }}
          
          <!-- Indicateurs de contrat -->
          <div v-if="isContractStartOrEndDate(day.date)" class="absolute top-1 right-1 flex space-x-1">
            <span 
              v-if="isStartOfContract(day.date)" 
              class="w-2 h-2 rounded-full bg-green-500 border border-white"
              title="Début de contrat"
            ></span>
            <span 
              v-else-if="isEndOfContract(day.date)" 
              class="w-2 h-2 rounded-full bg-red-500 border border-white"
              title="Fin de contrat"
            ></span>
          </div>
        </span>
      </div>
    </div>
    
    <!-- Infobulle -->
    <div 
      v-if="hoveredDate && getContractsForDate(hoveredDate.date).length > 0"
      class="fixed z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-left pointer-events-none transition-opacity duration-200"
      :style="{
        top: hoveredDate.y + 'px',
        left: hoveredDate.x + 'px',
        transform: isClient && hoveredDate.x > (windowSize.width || 0) - 280 ? 'translateX(calc(-100% + 20px))' : 'none',
      }"
    >
      <div v-for="contract in getContractsForDate(hoveredDate.date)" 
           :key="contract.id" 
           class="mb-2 last:mb-0 pb-2 border-b border-gray-100 last:border-0 last:pb-0">
        <div class="font-semibold text-blue-700">
          {{ contract.property?.title || 'Propriété sans nom' }}
        </div>
        <div class="text-xs text-gray-600 mt-1">
          <i class="fas fa-user-tie mr-1"></i>
          {{ contract.landlord ? `${contract.landlord.firstName} ${contract.landlord.lastName}` : 'Bailleur non spécifié' }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          <i class=""></i>
          {{ formatDate(contract.start_date) }} - 
          {{ contract.end_date ? formatDate(contract.end_date) : 'Indéfini' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

// Modèle d'adresse standardisé
interface Address {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

// Interface pour les propriétés
interface Property {
  id: number;
  title: string;
  description: string;
  address: Address | string;
  surface: number;
  rooms: number;
  bedrooms: number;
  floor: number;
  available: boolean;
  // Autres propriétés optionnelles
  [key: string]: any;
}

// Interface pour les utilisateurs (bailleurs, locataires, etc.)
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  userType?: string;
  // Pour les propriétés supplémentaires qui pourraient être présentes
  [key: string]: any;
}

interface Contract {
  id: number;
  start_date: string;
  end_date: string | null;
  status: string;
  property?: Property;
  property_id?: number;
  tenant?: User;
  tenant_id?: number;
  landlord?: User;
  landlord_id?: number;
  [key: string]: any;
}

// Vérification côté client
const isClient = typeof window !== 'undefined';

// État
const currentDate = ref(isClient ? new Date() : new Date(2023, 0, 1));

interface HoveredDate {
  date: Date;
  x: number;
  y: number;
}

interface DayInfo {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const hoveredDate = ref<HoveredDate | null>(null);
const tooltipTimeout = ref<number | null>(null);
const windowSize = ref({ width: 0, height: 0 });

// Données des contrats
const contracts = ref<Contract[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Récupération des contrats
const fetchContracts = async () => {
  console.log('Début de fetchContracts');
  const authStore = useAuthStore();
  
  try {
    // Vérifier l'authentification
    await authStore.checkAuth();
    const currentUser = authStore.currentUser as unknown as User;
    const userId = currentUser?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non connecté');
    }
    
    console.log('[CalendarCard] Récupération des contrats pour l\'utilisateur:', userId);
    
    isLoading.value = true;
    error.value = null;
    
    // Récupérer tous les contrats
    const response = await api.get('/contracts');
    console.log('[CalendarCard] Réponse de l\'API:', response);
    
    // Extraire les données de la réponse en fonction du format
    let allContracts: any[] = [];
    const responseData = response?.data || {};
    
    if (Array.isArray(responseData)) {
      allContracts = responseData;
    } else if (responseData && typeof responseData === 'object') {
      if (Array.isArray(responseData.data)) {
        allContracts = responseData.data;
      } else if (responseData.contracts && Array.isArray(responseData.contracts)) {
        allContracts = responseData.contracts;
      } else if (Object.keys(responseData).length > 0) {
        allContracts = [responseData];
      }
    }
    
    // Filtrer les contrats pour ne garder que ceux du locataire connecté
    const contractsData = allContracts.filter((contract: any) => {
      // Vérifier si le contrat appartient au locataire connecté
      const isTenant = contract.tenant_id === userId || 
                      (contract.tenant && contract.tenant.id === userId);
      
      // Vérifier si le contrat est actif ou à venir
      const now = new Date();
      const endDate = contract.end_date ? new Date(contract.end_date) : null;
      const isActive = !endDate || endDate >= now;
      
      return isTenant && isActive;
    });
    
    console.log(`[CalendarCard] ${contractsData.length} contrat(s) trouvé(s) pour l'utilisateur ${userId}`);
    
    /**
     * Récupère les détails d'une propriété via l'API
     * @param propertyId - ID de la propriété à récupérer
     * @returns Les détails de la propriété ou null en cas d'erreur
     */
    const fetchPropertyDetails = async (propertyId: number) => {
      if (!propertyId) {
        console.warn('[CalendarCard] Aucun ID de propriété fourni');
        return null;
      }
      
      console.log(`[CalendarCard] Tentative de récupération de la propriété ${propertyId}`);
      
      try {
        const response = await api.get(`/properties/${propertyId}`);
        const propertyData = response.data?.data || response.data;
        
        if (!propertyData) {
          console.warn(`[CalendarCard] Aucune donnée reçue pour la propriété ${propertyId}`);
          return null;
        }
        
        console.log(`[CalendarCard] Propriété ${propertyId} récupérée avec succès`);
        return propertyData;
        
      } catch (error: any) {
        // Gestion des erreurs HTTP
        if (error.response) {
          switch (error.response.status) {
            case 401:
              console.warn(`[CalendarCard] Non autorisé à accéder à la propriété ${propertyId}`);
              break;
            case 403:
              console.warn(`[CalendarCard] Accès refusé à la propriété ${propertyId}`);
              break;
            case 404:
              console.warn(`[CalendarCard] Propriété ${propertyId} non trouvée`);
              break;
            default:
              console.error(
                `[CalendarCard] Erreur ${error.response.status} lors de la récupération de la propriété ${propertyId}:`,
                error.response.data
              );
          }
        } else if (error.request) {
          console.error(`[CalendarCard] Pas de réponse du serveur pour la propriété ${propertyId}`, error.request);
        } else {
          console.error(`[CalendarCard] Erreur lors de la configuration de la requête pour la propriété ${propertyId}:`, error.message);
        }
        
        return null;
      }
    };

    /**
     * Améliore les contrats avec les détails des propriétés
     */
    const enhanceContractsWithPropertyDetails = async (contracts: any[]): Promise<any[]> => {
      console.log(`[CalendarCard] Début de l'amélioration de ${contracts.length} contrats`);
      
      const enhanced = [];
      let successCount = 0;
      
      for (const contract of contracts) {
        const contractId = contract.id || 'inconnu';
        
        try {
          // Si on a déjà les infos de la propriété, on les garde
          if (contract.property) {
            console.log(`[CalendarCard] [${contractId}] Propriété déjà incluse`);
            enhanced.push(contract);
            successCount++;
            continue;
          }
          
          // Vérification de l'ID de propriété
          const propertyId = contract.property_id;
          if (!propertyId) {
            console.warn(`[CalendarCard] [${contractId}] Aucun ID de propriété trouvé`);
            enhanced.push(contract);
            continue;
          }
          
          // Récupération des détails de la propriété
          console.log(`[CalendarCard] [${contractId}] Récupération des détails de la propriété ${propertyId}`);
          const propertyDetails = await fetchPropertyDetails(propertyId);
          
          if (propertyDetails) {
            console.log(`[CalendarCard] [${contractId}] Propriété ${propertyId} récupérée avec succès`);
            enhanced.push({ ...contract, property: propertyDetails });
            successCount++;
          } else {
            console.warn(`[CalendarCard] [${contractId}] Aucun détail disponible pour la propriété ${propertyId}`);
            enhanced.push(contract);
          }
          
        } catch (error) {
          console.error(`[CalendarCard] [${contractId}] Erreur lors du traitement:`, error);
          enhanced.push(contract);
        }
      }
      
      console.log(`[CalendarCard] Amélioration terminée: ${successCount}/${contracts.length} contrats améliorés avec succès`);
      return enhanced;
    };
    
    // Amélioration des contrats avec les détails des propriétés
    const enhancedContracts = await enhanceContractsWithPropertyDetails(contractsData);

    /**
     * Affiche un récapitulatif des contrats et de leurs propriétés
     */
    const logContractsSummary = (contracts: any[]) => {
      console.log('\n=== RÉCAPITULATIF DES CONTRATS ===');
      
      if (contracts.length === 0) {
        console.log('Aucun contrat à afficher');
        return;
      }
      
      contracts.forEach(contract => {
        const contractId = contract.id || 'inconnu';
        const startDate = contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'non spécifiée';
        const endDate = contract.end_date ? new Date(contract.end_date).toLocaleDateString() : 'non spécifiée';
        
        console.log(`\n[Contrat ${contractId}]`);
        console.log(`- Période: Du ${startDate} au ${endDate}`);
        
        if (contract.property) {
          const prop = contract.property;
          console.log(`- Propriété: #${prop.id} - ${prop.title || 'Sans titre'}`);
          
          if (typeof prop.address === 'string') {
            console.log(`  Adresse: ${prop.address}`);
          } else if (prop.address) {
            const addr = prop.address;
            const fullAddress = [
              addr.street,
              addr.postal_code,
              addr.city,
              addr.country
            ].filter(Boolean).join(', ');
            
            if (fullAddress) {
              console.log(`  Adresse: ${fullAddress}`);
            }
          }
          
        } else if (contract.property_id) {
          console.log(`- Propriété: #${contract.property_id} (détails non disponibles)`);
        } else {
          console.log('- Aucune propriété associée');
        }
      });
      
      console.log('\n=== FIN DU RÉCAPITULATIF ===\n');
    };
    
    // Affichage du récapitulatif
    logContractsSummary(enhancedContracts);
    
    if (enhancedContracts.length > 0) {
      // Formater les données pour correspondre à notre interface
      contracts.value = enhancedContracts.map((contract: any) => {
        // Créer un objet de base avec les champs obligatoires
        const formattedContract: any = {
          id: contract.id,
          start_date: contract.startDate || contract.start_date || '',
          end_date: contract.endDate || contract.end_date || null,
          status: contract.status || 'draft',
        };

        // Gérer la propriété
        if (contract.property) {
          // Si on a un objet property complet
          formattedContract.property = {
            id: contract.property.id || contract.property_id || 0,
            title: contract.property.title || `Propriété #${contract.property.title || contract.property.title || '?'}`,
            address: typeof contract.property.address === 'string' 
              ? contract.property.address 
              : {
                  street: contract.property.street || contract.property.address?.street || '',
                  city: contract.property.city || contract.property.address?.city || '',
                  postal_code: contract.property.postal_code || contract.property.address?.postal_code || '',
                  country: contract.property.country || contract.property.address?.country || 'congo'
                }
          };
        } else if (contract.property_id) {
          // Si on a seulement l'ID de la propriété
          formattedContract.property = {
            id: contract.property_id,
            title: `Propriété #${contract.property_id}`,
            address: {
              street: '',
              city: '',
              postal_code: '',
              country: 'congo'
            }
          };
        } else {
          // Aucune information sur la propriété
          formattedContract.property = {
            id: 0,
            title: `Contrat #${contract.id}`,
            address: {
              street: '',
              city: '',
              postal_code: '',
              country: 'congo'
            }
          };
        }

        // Gérer le bailleur
        if (contract.landlord) {
          formattedContract.landlord = {
            id: contract.landlord.id || contract.landlord_id || 0,
            firstName: contract.landlord.firstName || contract.landlord.first_name || '',
            lastName: contract.landlord.lastName || contract.landlord.last_name || 'Bailleur',
            email: contract.landlord.email || '',
            phone: contract.landlord.phone || ''
          };
        } else if (contract.landlord_id) {
          formattedContract.landlord = {
            id: contract.landlord_id,
            firstName: '',
            lastName: 'Bailleur',
            email: '',
            phone: ''
          };
        }

        // Gérer le locataire
        if (contract.tenant) {
          formattedContract.tenant = {
            id: contract.tenant.id || contract.tenant_id || 0,
            firstName: contract.tenant.firstName || contract.tenant.first_name || '',
            lastName: contract.tenant.lastName || contract.tenant.last_name || 'Locataire',
            email: contract.tenant.email || '',
            phone: contract.tenant.phone || ''
          };
        } else if (contract.tenant_id) {
          formattedContract.tenant = {
            id: contract.tenant_id,
            firstName: '',
            lastName: 'Locataire',
            email: '',
            phone: ''
          };
        }

        return formattedContract as Contract;
      });
      
      console.log('[CalendarCard] Contrats formatés:', contracts.value);
    } else {
      console.log('[CalendarCard] Aucun contrat trouvé pour l\'utilisateur');
      contracts.value = [];
    }
  } catch (err: any) {
    console.error('[CalendarCard] Erreur lors du chargement des contrats:', err);
    
    // Gestion des erreurs spécifiques
    if (err.response) {
      // Erreur de réponse du serveur (4xx, 5xx)
      const status = err.response.status;
      if (status === 401) {
        error.value = 'Session expirée. Veuillez vous reconnecter.';
        // Rediriger vers la page de connexion si nécessaire
        // router.push('/login');
      } else if (status === 403) {
        error.value = 'Vous n\'êtes pas autorisé à accéder à cette ressource.';
      } else if (status === 404) {
        error.value = 'Aucun contrat trouvé.';
        contracts.value = [];
      } else {
        error.value = `Erreur serveur (${status}). Veuillez réessayer plus tard.`;
      }
    } else if (err.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      error.value = 'Impossible de joindre le serveur. Vérifiez votre connexion Internet.';
    } else if (err.message === 'Utilisateur non connecté') {
      error.value = 'Veuillez vous connecter pour voir vos contrats';
    } else {
      // Erreur inattendue
      error.value = 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.';
    }
    
    // En cas d'erreur, vider la liste des contrats
    contracts.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Jours de la semaine
const days = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

// Mois et année actuels
const currentMonth = computed(() => {
  return currentDate.value.toLocaleDateString('fr-FR', { month: 'long' });
});

const currentYear = computed(() => {
  return currentDate.value.getFullYear();
});

// Génération des jours du mois
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // 0 = lundi, 6 = dimanche
  const daysInMonth = lastDay.getDate();
  
  const days: DayInfo[] = [];
  
  // Ajouter les jours du mois précédent
  for (let i = 0; i < firstDayOfWeek; i++) {
    const date = new Date(year, month, -firstDayOfWeek + i + 1);
    days.push({
      day: date.getDate(),
      date,
      isCurrentMonth: false,
      isToday: isToday(date)
    });
  }
  
  // Ajouter les jours du mois actuel
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      day,
      date,
      isCurrentMonth: true,
      isToday: isToday(date)
    });
  }
  
  // Ajouter les jours du mois suivant pour compléter la grille
  const remainingDays = 42 - days.length; // 6 lignes de 7 jours
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      day: i,
      date,
      isCurrentMonth: false,
      isToday: isToday(date)
    });
  }
  
  return days;
});

// Vérifier si une date est dans le mois en cours
const isCurrentMonth = (date: Date): boolean => {
  return date.getMonth() === currentDate.value.getMonth() && 
         date.getFullYear() === currentDate.value.getFullYear();
};

// Vérifie si une date est aujourd'hui
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// Navigation entre les mois
const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

// Fonction utilitaire pour comparer les dates
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// Fonction utilitaire pour formater une date au format JJ/MM/AAAA
function formatDate(dateString: string | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formate une adresse selon le modèle standardisé
 * @param address - L'adresse à formater (peut être une chaîne ou un objet Address)
 * @returns L'adresse formatée sous forme de chaîne lisible
 */
function formatAddress(address: Address | string | null | undefined): string {
  if (!address) return 'Adresse non disponible';
  
  // Si c'est déjà une chaîne, on la retourne telle quelle
  if (typeof address === 'string') {
    return address;
  }
  
  // Construction des parties de l'adresse
  const parts = [];
  
  if (address.street) parts.push(address.street);
  
  const cityPart = [];
  if (address.postal_code) cityPart.push(address.postal_code);
  if (address.city) cityPart.push(address.city);
  
  if (cityPart.length > 0) {
    parts.push(cityPart.join(' '));
  }
  
  if (address.country) parts.push(address.country);
  
  // Nettoyage des espaces superflus
  return parts.filter(Boolean).join(', ');
}

// Vérifier si une date est le début d'un contrat
const isStartOfContract = (date: Date): boolean => {
  if (!contracts.value) return false;
  return contracts.value.some(contract => 
    isSameDay(new Date(contract.start_date), date)
  );
};

// Vérifier si une date est la fin d'un contrat
const isEndOfContract = (date: Date): boolean => {
  if (!contracts.value) return false;
  return contracts.value.some(contract => 
    contract.end_date && isSameDay(new Date(contract.end_date), date)
  );
};

const isContractDate = (date: Date): boolean => {
  return isStartOfContract(date) || isEndOfContract(date);
};

// Alias pour la compatibilité
const isContractStartOrEndDate = isContractDate;

const getContractsForDate = (date: Date): Contract[] => {
  if (!date || !contracts.value) return [];
  
  return contracts.value.filter(contract => {
    if (!contract) return false;
    const startDate = new Date(contract.start_date);
    const endDate = contract.end_date ? new Date(contract.end_date) : null;
    
    // Ne retourner que si c'est le début ou la fin d'un contrat
    return isSameDay(startDate, date) || (endDate && isSameDay(endDate, date));
  });
};

// Gestion du clic sur un jour
const handleDayClick = (date: Date) => {
  if (isContractStartOrEndDate(date)) {
    // Logique de gestion du clic sur un jour avec contrat
    console.log('Jour cliqué:', date);
  }
};

// Mise à jour de la taille de la fenêtre
const updateWindowSize = () => {
  if (isClient && typeof window !== 'undefined') {
    windowSize.value = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
};

// Gestionnaire de survol de la souris
const handleMouseOver = (day: DayInfo, event: MouseEvent) => {
  if (isContractStartOrEndDate(day.date)) {
    if (!isClient) return;
    
    const tooltipWidth = 256; // Largeur de l'infobulle
    const windowWidth = window.innerWidth;
    const x = event.clientX;
    const y = event.clientY - 50;
    
    // Ajuster la position si l'infobulle dépasse de la fenêtre
    const adjustedX = x + tooltipWidth > windowWidth 
      ? windowWidth - tooltipWidth - 10 
      : x;
    
    const hoverData: HoveredDate = {
      date: day.date,
      x: adjustedX,
      y: y
    };
    
    hoveredDate.value = hoverData;
  }
};

// Gestionnaire de sortie de la souris
const handleMouseLeave = () => {
  hoveredDate.value = null;
};



// Gestion du redimensionnement de la fenêtre
onMounted(() => {
  if (isClient) {
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
  }
  
  return () => {
    if (isClient) {
      window.removeEventListener('resize', updateWindowSize);
    }
    if (tooltipTimeout.value) {
      clearTimeout(tooltipTimeout.value);
    }
  };
});

// Chargement initial des contrats
onMounted(() => {
  fetchContracts();
});
</script>

<style scoped>
/* Styles pour l'infobulle */
[class*="bg-blue"] {
  --tw-bg-opacity: 1;
}

[class*="text-blue"] {
  --tw-text-opacity: 1;
}

/* Animation pour l'infobulle */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Animation pour l'infobulle */
.fixed[style*="block"] {
  animation: fadeIn 0.15s ease-out forwards;
  opacity: 0;
}

/* Style pour les jours de fin de semaine */
.grid-cols-7 > div:nth-child(7n),
.grid-cols-7 > div:nth-child(7n+1) {
  color: #ef4444; /* Rouge pour les week-ends */
}

/* Style pour les jours du mois précédent/suivant */
.text-gray-300 {
  opacity: 0.5;
}

/* Style pour les indicateurs de contrat */
.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-red-50 {
  background-color: #fef2f2;
}
</style>
