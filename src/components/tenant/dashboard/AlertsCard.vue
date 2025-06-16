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
          <p>
            <span class="font-semibold">{{ alert.tenant }}</span>
            <span>{{ alert.message }}</span>
          </p>
          <p v-if="alert.timestamp" class="text-xs opacity-75 mt-1">
            {{ formatTimestamp(alert.timestamp) }}
          </p>
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

interface Alert {
  id: number | string;
  tenant: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp?: Date | string;
  read?: boolean;
}

const props = withDefaults(defineProps<{
  alerts?: Alert[];
  showViewAll?: boolean;
}>(), {
  alerts: () => [],
  showViewAll: true
});

const getAlertClasses = (alert: Alert) => {
  const baseClasses = {
    'bg-opacity-10': true,
    'hover:bg-opacity-20': true,
  };
  
  switch (alert.type) {
    case 'error':
      return {
        ...baseClasses,
        'bg-red-100': true,
        'text-red-600': true,
      };
    case 'warning':
      return {
        ...baseClasses,
        'bg-yellow-100': true,
        'text-yellow-600': true,
      };
    case 'success':
      return {
        ...baseClasses,
        'bg-green-100': true,
        'text-green-600': true,
      };
    case 'info':
    default:
      return {
        ...baseClasses,
        'bg-blue-100': true,
        'text-blue-600': true,
      };
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
