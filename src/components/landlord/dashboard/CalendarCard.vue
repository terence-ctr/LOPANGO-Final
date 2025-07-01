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
          <i class="fas fa-user-edit mr-1"></i>
          {{ contract.tenant ? `${contract.tenant.firstName} ${contract.tenant.lastName}` : 'Locataire inconnu' }}
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

// Type personnalisé pour l'utilisateur
interface CurrentUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  // Ajoutez d'autres propriétés si nécessaire
}

interface Contract {
  id: number;
  start_date: string;
  end_date: string | null;
  status: string;
  property?: {
    id: number;
    title: string;
    address: string;
  };
  tenant?: {
    id: number;
    firstName: string;
    lastName: string;
  };
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
  console.log('Store auth:', authStore);
  
  // Accès à l'utilisateur via currentUser qui est un computed property
  const currentUser = authStore.currentUser as unknown as CurrentUser;
  const userId = currentUser?.id;
  const token = authStore.getAuthToken();
  
  console.log('User object:', currentUser);
  console.log('userId:', userId);
  console.log('token:', token ? '***token présent***' : 'token manquant');
  
  if (!userId || !token) {
    console.error('Erreur d\'authentification - userId:', userId, 'token:', token ? 'présent' : 'manquant');
    error.value = 'Utilisateur non connecté';
    return;
  }

  isLoading.value = true;
  error.value = null;
  
  try {
    console.log('Tentative de récupération des contrats...');
    const response = await api.get('/contracts');
    
    console.log('Réponse des contrats:', response.data);
    
    // Formater les données pour correspondre à l'interface Contract
    contracts.value = response.data.map((contract: any) => ({
      id: contract.id,
      start_date: contract.startDate,
      end_date: contract.endDate,
      status: contract.status,
      property: contract.property ? {
        id: contract.property.id,
        title: contract.property.title,
        address: contract.property.address
      } : undefined,
      tenant: contract.tenant ? {
        id: contract.tenant.id,
        firstName: contract.tenant.firstName,
        lastName: contract.tenant.lastName
      } : undefined
    }));
    
    console.log('Contrats chargés:', contracts.value);
  } catch (err: any) {
    console.error('Erreur lors du chargement des contrats:', err);
    error.value = 'Erreur lors du chargement des contrats';
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

// Formatage des dates
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
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
