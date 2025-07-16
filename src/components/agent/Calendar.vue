<template>
    <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
      <!-- En-tête avec navigation -->
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
          class="relative p-1 min-h-2"
          :class="getDayClass(day)"
          @mouseover="(e) => handleMouseOver(day, e)"
          @mouseleave="handleMouseLeave"
          @click="handleDayClick(day.date)"
        >
          <!-- Jour du mois -->
          <span 
            class="inline-flex items-center justify-center h-5 w-5 rounded-full text-xs relative"
            :class="{
              'bg-blue-500 text-white': day.isToday,
              'font-semibold': day.isCurrentMonth,
              'text-gray-400': !day.isCurrentMonth
            }"
          >
            {{ day.day }}
            <template v-if="hasEvents(day.date) || getEventsForDay(day.date).length > 0">
              <div 
                class="absolute -bottom-1 -right-1 w-2 h-2 rounded-full cursor-pointer"
                :class="getEventDotClass(day.date)"
                v-tooltip="getTooltipOptions(day)"
              ></div>
            </template>
          </span>
        </div>
      </div>
      
      <!-- Légende 
      <div class="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div class="flex items-center">
          <div class="w-4 h-4 rounded bg-blue-100 border-l-4 border-blue-500 mr-2"></div>
          <span>Contrat actif</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 rounded bg-green-100 border-l-4 border-green-500 mr-2"></div>
          <span>Début de contrat</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 rounded bg-red-100 border-l-4 border-red-500 mr-2"></div>
          <span>Fin de contrat</span>
        </div>
      </div>-->
    </div>
  </template>
  
  <script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import { useContractStore } from '@/stores/contractStore';
import { apiConfig } from '@/config/api.config';

// Store
const contractStore = useContractStore();
const authStore = useAuthStore();
  
  // Vérification côté client
  const isClient = typeof window !== 'undefined';
  
  onMounted(() => {
    if (isClient) {
      window.addEventListener('resize', updateWindowSize);
      updateWindowSize();
      fetchContracts();
    }
  });
  
  // Types
  interface Address {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  }
  
  interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    userType?: string;
  }
  
  interface Property {
    id: number;
    title: string;
    description?: string;
    price: number;
    address: string | Address;
    landlord_id: number;
    created_at?: string;
    updated_at?: string;
    surface?: number;
    rooms?: number;
    bedrooms?: number;
    floor?: number;
    available?: boolean;
  }
  
  interface Contract {
    id: number;
    start_date: string;
    startDate?: string; // Alias pour la compatibilité
    end_date: string | null;
    endDate?: string | null; // Alias pour la compatibilité
    status: string;
    property: Property;
    property_id?: number;
    landlord_id?: number;
    tenant_id?: number;
    tenant?: User;
    landlord?: User;
    
    // Champs pour l'affichage
    property_title?: string;
    property_address?: string;
    property_address_street?: string;
    property_address_city?: string;
    property_address_postal_code?: string;
    property_address_country?: string;
    tenant_first_name?: string;
    tenant_last_name?: string;
    tenant_email?: string;
    tenant_phone?: string;
    rent?: number | string;
    deposit?: number | string;
    deposit_status?: string;
    currency?: string;
    
    // Pour la rétrocompatibilité
    [key: string]: any;
  }
  
  interface CalendarEvent {
    id: number;
    title: string;
    date: Date;
    propertyTitle: string;
    type: 'start' | 'end' | 'active' | 'payment';
    contract: Contract;
    tooltipText: string;
  }
  
  interface DayInfo {
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }
  
  interface HoveredDate {
    date: Date;
    x: number;
    y: number;
  }
  
  // Références
  const currentDate = ref(new Date());
  const hoveredDate = ref<HoveredDate | null>(null);
  
  // Vérifie si une date est aujourd'hui
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const windowSize = ref({
    width: 0,
    height: 0
  });
  
  // Mise à jour initiale de la taille de la fenêtre
  if (typeof window !== 'undefined') {
    windowSize.value = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const contracts = ref<Contract[]>([]);
  
  // Jours de la semaine
  const days = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
  
  // Mise à jour de la taille de la fenêtre
  const updateWindowSize = () => {
    if (isClient) {
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
      const x = event.clientX;
      const y = event.clientY - 50;
      
      // Ajuster la position si l'infobulle dépasse de la fenêtre
      const adjustedX = x + tooltipWidth > windowSize.value.width 
        ? windowSize.value.width - tooltipWidth - 10 
        : x;
      
      hoveredDate.value = {
        date: day.date,
        x: adjustedX,
        y: y
      };
    }
  };
  
  // Gestionnaire de sortie de la souris
  const handleMouseLeave = () => {
    hoveredDate.value = null;
  };
  
  // Gestion du clic sur un jour
  const handleDayClick = (date: Date) => {
    if (isContractStartOrEndDate(date)) {
      // Logique de gestion du clic sur un jour avec contrat
      console.log('Jour cliqué:', date);
    }
  };
  
  // Formate une date au format JJ/MM/AAAA
  const formatDate = (dateString: string | Date | null): string => {
    if (!dateString) return '';
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Détermine la position optimale pour l'infobulle en fonction de la position dans le mois
  const getOptimalPlacement = (day: DayInfo) => {
    const dayOfWeek = day.date.getDay();
    const isLastWeek = day.date.getDate() > 21;
    
    if (dayOfWeek > 3 && !isLastWeek) return 'left';
    if (dayOfWeek < 3 || isLastWeek) return 'right';
    return 'bottom';
  };
  
  // Options de l'infobulle avec positionnement dynamique
  const getTooltipOptions = (day: DayInfo) => {
    const placement = getOptimalPlacement(day);
    const tooltip = getEventTooltip(day.date);
    
    if (!tooltip) return null;
    
    // S'assurer que les infobulles sont recréées lors du changement de mois
    const monthKey = currentDate.value.getMonth() + currentDate.value.getFullYear() * 12;
    
    return {
      ...tooltip,
      // Ajouter une clé unique pour forcer la mise à jour
      key: `tooltip-${day.date.getDate()}-${day.date.getMonth()}-${monthKey}`,
      placement,
      offset: placement === 'bottom' ? [0, 10] : [10, 0],
      theme: 'bg-white',
      trigger: 'click hover',
      hideOnTargetClick: false,
      arrow: true,
      arrowType: 'round',
      distance: 8
    };
  };
  
  // Vérifie si une date est dans le mois en cours
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.value.getMonth() && 
           date.getFullYear() === currentDate.value.getFullYear();
  };
  
  // Vérifie si deux dates correspondent au même jour
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  // Vérifie si une date est le début d'un contrat
  const isStartOfContract = (date: Date): boolean => {
    if (!contracts.value || contracts.value.length === 0) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    
    return contracts.value.some(contract => {
      if (!contract.start_date) return false;
      const startDate = new Date(contract.start_date).toISOString().split('T')[0];
      return dateStr === startDate;
    });
  };
  
  // Vérifie si une date est la fin d'un contrat
  const isEndOfContract = (date: Date): boolean => {
    if (!contracts.value || contracts.value.length === 0) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    
    return contracts.value.some(contract => {
      if (!contract.end_date) return false;
      const endDate = new Date(contract.end_date).toISOString().split('T')[0];
      return dateStr === endDate;
    });
  };
  
  // Récupère les contrats pour une date donnée
  const getContractsForDate = (date: Date): Contract[] => {
    if (!contracts.value || contracts.value.length === 0) return [];
    
    return contracts.value.filter((contract): contract is Contract => {
      if (!contract) return false;
      
      const startDate = new Date(contract.start_date);
      const endDate = contract.end_date ? new Date(contract.end_date) : null;
      
      return date >= startDate && (!endDate || date <= endDate);
    });
  };
  
  // Formatte une adresse
  const formatAddress = (address: string | Address | undefined | null): string => {
    if (!address) return 'Adresse non disponible';
    
    if (typeof address === 'string') {
      return address || 'Adresse non disponible';
    }
    
    const parts = [
      address.street,
      address.postal_code,
      address.city,
      address.country
    ];
    
    return parts.filter(Boolean).join(', ');
  };
  
  // Données calculées
  const currentMonth = computed(() => {
    return currentDate.value.toLocaleDateString('fr-FR', { 
      month: 'long',
      year: 'numeric'
    }).split(' ')[0];
  });
  
  const currentYear = computed(() => {
    return currentDate.value.getFullYear();
  });
  
  // Génère les jours du mois courant avec les informations nécessaires
  const daysInMonth = computed<DayInfo[]>(() => {
    if (!isClient) return [];
    
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Jours du mois précédent à afficher
    const prevMonthDays = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    // Jours du mois prochain à afficher
    const nextMonthDays = 6 - lastDay.getDay();
    
    const days: DayInfo[] = [];
    
    // Ajouter les jours du mois précédent
    if (prevMonthDays > 0) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      
      for (let i = prevMonthDays - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const date = new Date(prevYear, prevMonth, day);
        days.push({
          day,
          date,
          isCurrentMonth: false,
          isToday: isToday(date)
        });
      }
    }
    
    // Ajouter les jours du mois courant
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        date,
        isCurrentMonth: true,
        isToday: isToday(date)
      });
    }
    
    // Ajouter les jours du mois prochain
    if (nextMonthDays > 0) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      
      for (let day = 1; day <= nextMonthDays; day++) {
        const date = new Date(nextYear, nextMonth, day);
        days.push({
          day,
          date,
          isCurrentMonth: false,
          isToday: isToday(date)
        });
      }
    }
    
    return days;
  });
  
  // Vérifie si une date est le début ou la fin d'un contrat
  const isContractStartOrEndDate = (date: Date): boolean => {
    return isStartOfContract(date) || isEndOfContract(date);
  };
  
  // Vérifie si une date est dans la période d'un contrat
  const isInContractPeriod = (date: Date, contract: Contract | null): boolean => {
    if (!contract) return false;
    
    const startDate = new Date(contract.start_date);
    const endDate = contract.end_date ? new Date(contract.end_date) : null;
    
    return date >= startDate && (!endDate || date <= endDate);
  };
  
  // Vérifie si une date est un jour de paiement (5 de chaque mois)
  const isPaymentDay = (date: Date): boolean => {
    return date.getDate() === 5;
  };
  
  // Vérifie si un jour a des événements
  const hasEvents = (date: Date): boolean => {
    if (!contracts.value || contracts.value.length === 0) return false;
    return isContractStartOrEndDate(date) || 
           contracts.value.some(contract => isInContractPeriod(date, contract)) || 
           isPaymentDay(date);
  };
  
  // Récupère la classe CSS pour un jour donné
  const getDayClass = (day: DayInfo): string => {
    const classes = [];
    
    if (!day.isCurrentMonth) {
      classes.push('text-gray-400');
    }
    
    if (day.isToday) {
      classes.push('font-bold bg-blue-50 rounded-full w-8 h-8 flex items-center justify-center');
    }
    
    if (isContractStartOrEndDate(day.date)) {
      classes.push('relative');
    }
    
    return classes.join(' ');
  };
  
  // Récupère les indicateurs pour un jour donné
  const getDayIndicators = (date: Date): string[] => {
    const indicators: string[] = [];
    
    if (!contracts.value || contracts.value.length === 0) return indicators;
    
    const events = getEventsForDay(date);
    
    // Ne garder que l'indicateur de début de contrat (vert)
    events.forEach(event => {
      if (event?.type === 'start') {
        indicators.push('bg-green-500');
      }
    });
    
    return indicators;
  };
  
  // Générer les jours du calendrier
  const calendarDays = computed(() => {
    if (!currentDate.value) return [];
    
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
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
    const remainingDays = 42 - days.length;
    if (remainingDays > 0) {
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          day: i,
          date,
          isCurrentMonth: false,
          isToday: isToday(date)
        });
      }
    }
    
    return days;
  });
  
  // Récupère le contenu de l'infobulle pour un jour donné
  const getDayTooltip = (date: Date) => {
    const events = getEventsForDay(date);
    if (events.length === 0) return null;
    
    // Vérifier si c'est un jour de paiement (5 de chaque mois)
    const isPaymentDate = date.getDate() === 5 && events.some(e => e.type === 'payment');
    
    // Si c'est un jour de paiement, ajouter un événement de paiement
    if (isPaymentDate) {
      const activeContract = events.find(e => e.type === 'active')?.contract;
      if (activeContract) {
        events.push({
          id: activeContract.id * 10 + 4,
          title: 'Paiement du loyer',
          date: date,
          propertyTitle: activeContract.property.title,
          type: 'payment',
          contract: activeContract,
          tooltipText: `
            <div class="text-sm">
              <div class="font-bold">Paiement du loyer</div>
              <div class="text-gray-600">${activeContract.property.title}</div>
              <div>${formatAddress(activeContract.property.address)}</div>
              ${activeContract.landlord ? `<div class="mt-2"><span class="font-medium">Locataire:</span> ${activeContract.landlord.first_name} ${activeContract.landlord.last_name}</div>` : ''}
              <div class="mt-1"><span class="font-medium">Montant:</span> ${activeContract.property.price.toFixed(2)} €</div>
              <div><span class="font-medium">Date d'échéance:</span> Le 5 de chaque mois</div>
            </div>
          `
        });
      }
    }
    
    const tooltipContent = events.map(event => event.tooltipText).join('<div class="my-2 border-t border-gray-200 "></div>');
    
    return {
      content: `
        <div class="text-sm max-w-xs">
          <div class="font-bold text-lg mb-2">${date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          ${tooltipContent}
        </div>
      `,
      html: true,
      theme: 'tooltip-theme',
      placement: 'right',
      offset: [0, 10],
      trigger: 'hover',
      hideOnTargetClick: false
    };
  };
  
  const previousMonth = () => {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      1
    );
    // Forcer la mise à jour des infobulles
    setTimeout(() => {
      // Cette ligne force le composant à se mettre à jour
      currentDate.value = new Date(currentDate.value);
    }, 0);
  };
  
  const nextMonth = () => {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1,
      1
    );
    // Forcer la mise à jour des infobulles
    setTimeout(() => {
      // Cette ligne force le composant à se mettre à jour
      currentDate.value = new Date(currentDate.value);
    }, 0);
  };
  
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    if (!contracts.value || !Array.isArray(contracts.value)) return [];
    
    const events: CalendarEvent[] = [];
    const dateStr = date.toISOString().split('T')[0];
    
    contracts.value.forEach(contract => {
      if (!contract || !contract.start_date) return;
      
      try {
        const startDate = new Date(contract.start_date).toISOString().split('T')[0];
        const endDate = contract.end_date ? new Date(contract.end_date).toISOString().split('T')[0] : null;
        
        // Vérifier si c'est le début d'un contrat
        if (dateStr === startDate) {
          const propertyTitle = contract.property?.title || contract.property_title || 'Propriété inconnue';
          const propertyAddress = contract.property?.address || contract.property_address || 'Adresse non disponible';
          const landlordName = contract.landlord_display || 
                             (contract.landlord ? 
                               `${contract.landlord.first_name || ''} ${contract.landlord.last_name || ''}`.trim() : 
                               'Propriétaire inconnu');
          
          const event: CalendarEvent = {
            id: contract.id * 10 + 1, // ID unique pour l'événement de début
            title: 'Début de location',
            date: new Date(contract.start_date),
            propertyTitle: propertyTitle,
            type: 'start',
            contract: contract,
            tooltipText: `
              <div class="text-sm bg-white p-2 rounded">
                <div class="font-bold text-gray-900">${propertyTitle}</div>
                <div class="text-gray-600 mb-1">Début de location</div>
                <div class="text-gray-700">${propertyAddress}</div>
                <div class="mt-2">
                  <span class="font-medium text-gray-800">Propriétaire:</span> 
                  <span class="text-gray-700">${landlordName}</span>
                </div>
                <div class="grid grid-cols-2 gap-1 mt-1">
                  <div><span class="font-medium text-gray-800">Du:</span> ${formatDate(contract.start_date)}</div>
                  ${endDate ? `<div><span class="font-medium text-gray-800">Au:</span> ${formatDate(contract.end_date)}</div>` : ''}
                  <div><span class="font-medium text-gray-800">Loyer:</span> ${contract.rent || 'Non spécifié'}</div>
                  ${contract.deposit ? 
                    `<div class="col-span-2">
                      <span class="font-medium text-gray-800">Dépôt:</span> 
                      <span class="text-gray-700">${contract.deposit} ${contract.currency ? `(${contract.currency})` : ''} 
                      ${contract.deposit_status ? `- ${contract.deposit_status}` : ''}</span>
                    </div>` 
                    : ''}
                </div>
              </div>
            `,
          };
          events.push(event);
        }
        
        // Vérifier si c'est la fin d'un contrat
        if (endDate && dateStr === endDate && contract.end_date) {
          const propertyTitle = contract.property?.title || contract.property_title || 'Propriété inconnue';
          const propertyAddress = contract.property?.address || contract.property_address || 'Adresse non disponible';
          const landlordDisplay = contract.landlord_display || 
                               (contract.landlord ? 
                                 `${contract.landlord.first_name || ''} ${contract.landlord.last_name || ''}`.trim() : 
                                 'Propriétaire inconnu');
          
          const endEvent: CalendarEvent = {
            id: contract.id * 10 + 2, // ID unique pour l'événement de fin
            title: 'Fin de location',
            date: new Date(contract.end_date),
            propertyTitle: propertyTitle,
            type: 'end',
            contract: contract,
            tooltipText: `
              <div class="text-sm bg-white p-2 rounded">
                <div class="font-bold text-gray-900">${propertyTitle}</div>
                <div class="text-gray-600 mb-1">Fin de location</div>
                <div class="text-gray-700">${propertyAddress}</div>
                <div class="mt-2">
                  <span class="font-medium text-gray-800">Propriétaire:</span> 
                  <span class="text-gray-700">${landlordDisplay}</span>
                </div>
                <div class="grid grid-cols-2 gap-1 mt-1">
                  <div><span class="font-medium text-gray-800">Date de fin:</span> ${formatDate(contract.end_date)}</div>
                  <div><span class="font-medium text-gray-800">Loyer:</span> ${contract.rent || 'Non spécifié'}</div>
                  ${contract.deposit ? 
                    `<div class="col-span-2">
                      <span class="font-medium text-gray-800">Dépôt:</span> 
                      <span class="text-gray-700">${contract.deposit} ${contract.currency ? `(${contract.currency})` : ''} 
                      ${contract.deposit_status ? `- ${contract.deposit_status}` : ''}</span>
                    </div>` 
                    : ''}
                </div>
              </div>
            `,
          };
          events.push(endEvent);
        }
        
        // Vérifier si c'est un jour de paiement (5 du mois)
        if (isPaymentDay(date) && contract.rent) {
          const propertyTitle = contract.property?.title || contract.property_title || 'Propriété inconnue';
          const paymentEvent: CalendarEvent = {
            id: contract.id * 100 + date.getDate(), // ID unique pour l'événement de paiement
            title: 'Paiement du loyer',
            date: date,
            propertyTitle: propertyTitle,
            type: 'payment',
            contract: contract,
            tooltipText: `
              <div class="text-sm bg-white p-2 rounded">
                <div class="font-bold text-gray-900">${propertyTitle}</div>
                <div class="text-gray-600 mb-1">Échéance du loyer</div>
                <div class="grid grid-cols-2 gap-1">
                  <div><span class="font-medium text-gray-800">Montant:</span> ${contract.rent}</div>
                  <div><span class="font-medium text-gray-800">Date:</span> ${formatDate(date)}</div>
                  ${contract.currency ? `<div class="col-span-2"><span class="font-medium text-gray-800">Devise:</span> ${contract.currency}</div>` : ''}
                </div>
              </div>
            `,
          };
          events.push(paymentEvent);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des événements pour le jour:', error);
      }
    });
    
    return events;
  };
  
  const getEventDotClass = (date: Date): string => {
    const events = getEventsForDay(date);
    if (events.length === 0) return '';
    
    // Priorité: start > end > payment > active
    if (events.some(e => e.type === 'start')) return 'bg-green-500';
    if (events.some(e => e.type === 'end')) return 'bg-red-500';
    if (events.some(e => e.type === 'payment')) return 'bg-blue-500';
    return 'bg-gray-400';
  };
  
  interface TooltipOptions {
    content: string;
    html: boolean;
    theme: string;
    arrow: boolean;
    offset: [number, number];
  }
  
  const getEventTooltip = (date: Date): TooltipOptions | null => {
    const events = getEventsForDay(date);
    if (!events || events.length === 0) return null;
    
    try {
      // Formater la date en français
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      };
      const formattedDate = date.toLocaleDateString('fr-FR', options);
      
      // Créer le contenu de l'infobulle avec la date en entête
      const content = `
        <div class="max-w-xs bg-white p-2 rounded">
          <div class="font-semibold text-sm text-gray-800 mb-2">${formattedDate}</div>
          <div class="space-y-2 text-xs">
            ${events.map(event => {
              const propertyAddress = event.contract?.property_address || 
                                   event.contract?.property?.address || 
                                   'Adresse non disponible';
              return `
                <div class="border-t border-gray-100 pt-2 first:border-0 first:pt-0">
                  <div class="font-medium text-gray-900 flex items-center gap-1">
                    <span class="inline-block w-2 h-2 rounded-full ${
                      event.type === 'start' ? 'bg-green-500' : 
                      event.type === 'end' ? 'bg-red-500' : 'bg-blue-500'
                    }"></span>
                    ${event.title}
                  </div>
                  <div class="text-gray-700 ml-3">${event.propertyTitle}</div>
                  <div class="text-gray-500 text-xs truncate ml-3">${propertyAddress}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
      
      return {
        content: content,
        html: true,
        theme: 'tooltip-theme',
        arrow: true,
        offset: [0, 10]
      };
    } catch (error) {
      console.error('Erreur lors de la génération de l\'infobulle:', error);
      return null;
    }
  };
  
  const getEventClass = (event: CalendarEvent): string => {
    const baseClasses = 'text-xs p-1 rounded truncate';
    
    if (!event) return baseClasses;
    
    if (event.type === 'start') {
      return `${baseClasses} bg-green-100 text-green-800 border-l-4 border-green-500`;
    } else if (event.type === 'end') {
      return `${baseClasses} bg-red-100 text-red-800 border-l-4 border-red-500`;
    } else if (event.type === 'payment') {
      return `${baseClasses} bg-blue-100 text-blue-800 border-l-4 border-blue-500`;
    }
    
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };
  
  // Récupération des contrats
  const fetchContracts = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Récupérer l'utilisateur connecté
      const currentUser = authStore.user;
      console.log('Utilisateur connecté:', currentUser);
      
      // Récupérer l'ID en vérifiant à la fois 'id' et '_id'
      const userId = (currentUser as any)?.id || (currentUser as any)?._id;
      
      if (!currentUser || !userId) {
        const errorMsg = 'Utilisateur non connecté ou ID manquant';
        console.error('Erreur:', errorMsg, { user: currentUser });
        error.value = errorMsg;
        return;
      }
      console.log('ID de l\'utilisateur connecté:', userId);
      
      console.log('Récupération des contrats pour l\'agent:', userId);
      
      // Récupérer le token d'authentification
      const token = authStore.getAuthToken();
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }
      
      // Récupérer les contrats depuis l'API avec les relations et l'authentification
      const response = await api.get(apiConfig.endpoints.contracts.byAgent(userId), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log('Réponse de l\'API complète:', response);
      
      // Vérifier si la réponse contient des données
      if (!response.data) {
        console.error('Aucune donnée dans la réponse:', response);
        throw new Error('Aucune donnée reçue de l\'API');
      }
      
      // Vérifier si les données sont dans response.data.data (format JSON:API) ou directement dans response.data
      let responseData: any[] = [];
      
      if (Array.isArray(response.data)) {
        responseData = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        responseData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data && typeof response.data === 'object') {
        // Si la réponse est un objet unique, le mettre dans un tableau
        responseData = [response.data];
      }
      
      console.log('Données des contrats:', responseData);
      
      // Mapper les contrats pour s'assurer qu'ils ont le bon format
      const formattedContracts = responseData.map((contract: any) => {
        // Créer un nouvel objet avec toutes les propriétés nécessaires
        const formattedContract: Contract = {
          ...contract,
          // Assurer la compatibilité avec les champs en camelCase et snake_case
          start_date: contract.start_date || contract.startDate,
          startDate: contract.startDate || contract.start_date,
          end_date: contract.end_date || contract.endDate || null,
          endDate: contract.endDate || contract.end_date || null,
          property_id: contract.property_id || contract.propertyId,
          landlord_id: contract.landlord_id || contract.landlordId,
          tenant_id: contract.tenant_id || contract.tenantId,
          
          // Propriétés pour l'affichage
          property_title: contract.property?.title || `${contract.property_title || '?'}`,
          property_address: contract.property_address || 
                           (contract.property?.address?.street ? 
                             `${contract.property.address.street}, ${contract.property.address.postal_code} ${contract.property.address.city}` : 
                             (contract.property_address_country || 'Adresse non disponible')),
          
          // Informations sur le locataire
          landlord_first_name: contract.landlord?.first_name || contract.landlord?.firstName || '',
          landlord_last_name: contract.landlord?.last_name || contract.landlord?.lastName || '',
          tenant_email: contract.tenant?.email || '',
          tenant_phone: contract.tenant?.phone || '',
          
          // Informations financières
          rent: contract.rent ? `${contract.rent} ${contract.currency || 'USD'}` : 'Non spécifié',
          deposit: contract.deposit ? `${contract.deposit} ${contract.currency || 'USD'}` : '',
          deposit_status: contract.deposit_status || 'non spécifié',
          currency: contract.currency || 'USD',
          
          // Conserver la référence à l'objet property complet
          property: contract.property || {},
          
          // Conserver la référence à l'objet tenant complet
          landlord: contract.landlord || {},
          
          // Conserver la référence à l'objet tenant complet
          tenant: contract.tenant || {}
        };
        
        // Créer une chaîne d'affichage pour le propriétaire
        formattedContract.landlord_display = 
          (formattedContract.landlord_first_name || formattedContract.landlord_last_name) ?
          `${formattedContract.landlord_first_name || ''} ${formattedContract.landlord_last_name || ''}`.trim() :
          (contract.landlord_first_name || `Propriétaire #${formattedContract.landlord_id || '?'}`);
          
          
        
        console.log('Contrat formaté:', formattedContract);
        return formattedContract;
      });
      
      contracts.value = formattedContracts;
      
      // Afficher les contrats dans la console pour le débogage
      console.log('[PROPRIETAIRE] Contrats récupérés:', {
        count: contracts.value.length,
        contrats: contracts.value.map(c => ({
          id: c.id,
          start_date: c.start_date,
          end_date: c.end_date,
          status: c.status,
          property: c.property ? c.property.title : 'Inconnu',
          landlord: c.landlord ? `${c.landlord.first_name} ${c.landlord.last_name}` : 'Inconnu',
        }))
      });
      
    } catch (caughtError: unknown) {
      const errorMessage = caughtError instanceof Error ? caughtError.message : 'Une erreur inconnue est survenue';
      console.error('Erreur lors de la récupération des contrats:', caughtError);
      error.value = 'Erreur lors du chargement des contrats';
      
      // Vérifier si c'est une erreur avec une réponse
      if (caughtError && 
          typeof caughtError === 'object' && 
          'response' in caughtError && 
          caughtError.response && 
          typeof caughtError.response === 'object') {
        
        const response = caughtError.response as {
          status?: number;
          data?: unknown;
        };
        
        const errorDetails: Record<string, unknown> = {
          status: response.status,
          data: response.data
        };
        
        if ('config' in caughtError) {
          errorDetails.config = (caughtError as { config?: unknown }).config;
        }
        
        console.error('Détails de l\'erreur:', errorDetails);
      } else {
        console.error('Erreur:', errorMessage);
      }
    } finally {
      isLoading.value = false;
    }
  };
  
  // La logique de onMounted a été déplacée plus haut
  </script>
  