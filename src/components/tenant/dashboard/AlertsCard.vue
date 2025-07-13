<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Alertes</h3>
      <button class="text-gray-400 hover:text-gray-600">
        <i class="fas fa-ellipsis-v"></i>
      </button>
    </div>
    
    <div v-if="alerts.length === 0" class="text-center py-4 text-gray-500">
      Aucune alerte pour le moment
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="(alert, index) in alerts" :key="index" class="flex items-start p-3 rounded-lg" :class="getAlertClass(alert.type)">
        <div class="flex-shrink-0 mt-0.5">
          <i class="fas" :class="getAlertIcon(alert.type)"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">{{ alert.title }}</p>
          <p class="text-xs text-gray-600 mt-1">{{ alert.message }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ formatDate(alert.date) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Alert {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  date: Date;
  read: boolean;
}

const alerts = ref<Alert[]>([
  // Add sample alerts or fetch from your API
]);

const getAlertClass = (type: string) => {
  const classes = {
    info: 'bg-blue-50 text-blue-800',
    warning: 'bg-yellow-50 text-yellow-800',
    error: 'bg-red-50 text-red-800',
    success: 'bg-green-50 text-green-800',
  };
  return classes[type as keyof typeof classes] || 'bg-gray-50';
};

const getAlertIcon = (type: string) => {
  const icons = {
    info: 'fa-info-circle text-blue-500',
    warning: 'fa-exclamation-triangle text-yellow-500',
    error: 'fa-times-circle text-red-500',
    success: 'fa-check-circle text-green-500',
  };
  return icons[type as keyof typeof icons] || 'fa-bell';
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
