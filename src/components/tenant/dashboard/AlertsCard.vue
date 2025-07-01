<template>
  <section class="bg-white rounded-xl shadow-md p-6">
    <h3 class="font-extrabold mb-4">Alertes</h3>
    
    <div class="space-y-4">
      <div 
        v-for="(alert, index) in alerts" 
        :key="index"
        class="rounded-md p-3 text-xs flex items-start space-x-2 transition-all duration-200"
        :class="getAlertClasses(alert)"
        role="alert"
      >
        <font-awesome-icon 
          :icon="['fas', getAlertIcon(alert)]" 
          class="mt-0.5 flex-shrink-0"
        />
        <div>
          <p class="font-semibold">{{ alert.title }}</p>
          <p class="text-sm">{{ alert.message }}</p>
          <div class="flex justify-between items-center mt-1">
            <span class="text-xs opacity-75">{{ alert.property }}</span>
            <span class="text-xs opacity-75">
              {{ formatTimestamp(alert.timestamp) }}
            </span>
          </div>
        </div>
      </div>
      
      <div 
        v-if="alerts.length === 0"
        class="text-center py-4 text-gray-500 text-sm"
      >
        Aucune alerte pour le moment
      </div>
      
      <div v-if="showViewAll && alerts.length > 0" class="pt-2">
        <button 
          @click="$emit('view-all')"
          class="text-blue-600 hover:text-blue-800 text-xs font-medium inline-flex items-center"
        >
          Voir toutes les alertes
          <font-awesome-icon :icon="['fas', 'arrow-right']" class="ml-1 text-xs" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineProps, withDefaults } from 'vue';

type Alert = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string | Date;
  read: boolean;
  propertyId?: string;
  contractId?: string;
  tenant: string;
  property: string;
};

const props = withDefaults(defineProps<{
  alerts?: Alert[];
  showViewAll?: boolean;
}>(), {
  alerts: () => [],
  showViewAll: true
});

const getAlertClasses = (alert: Alert) => {
  const baseClasses = 'bg-opacity-10 hover:bg-opacity-20';
  
  switch (alert.type) {
    case 'error':
      return `${baseClasses} bg-red-100 text-red-600`;
    case 'warning':
      return `${baseClasses} bg-yellow-100 text-yellow-600`;
    case 'success':
      return `${baseClasses} bg-green-100 text-green-600`;
    case 'info':
    default:
      return `${baseClasses} bg-blue-100 text-blue-600`;
  }
};

const getAlertIcon = (alert: Alert) => {
  switch (alert.type) {
    case 'error':
      return 'exclamation-circle';
    case 'warning':
      return 'exclamation-triangle';
    case 'success':
      return 'check-circle';
    case 'info':
    default:
      return 'info-circle';
  }
};

const formatTimestamp = (timestamp: Date | string) => {
  if (!timestamp) return '';
  
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
</script>
