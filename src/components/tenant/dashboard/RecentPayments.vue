<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="p-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h3 class="text-sm font-medium text-gray-900">Derniers paiements</h3>
        <router-link 
          to="/tenant/payments" 
          class="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          Voir tout
        </router-link>
      </div>
    </div>
    
    <div class="divide-y divide-gray-200">
      <div 
        v-for="(payment, index) in recentPayments" 
        :key="index"
        class="p-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ payment.reference }}</p>
            <p class="text-xs text-gray-500">{{ payment.date }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium" :class="getAmountClass(payment.amount)">
              {{ formatCurrency(payment.amount) }}
            </p>
            <span 
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              :class="getStatusClasses(payment.status)"
            >
              {{ getStatusText(payment.status) }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="recentPayments.length === 0" class="p-4 text-center">
        <p class="text-sm text-gray-500">Aucun paiement récent</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Payment } from '../../../types/payment';

const props = defineProps<{
  payments: Payment[];
  maxItems?: number;
}>();

const maxItemsToShow = props.maxItems || 5;

const recentPayments = computed(() => {
  if (!props.payments) return [];
  return [...props.payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxItemsToShow);
});

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const getStatusClasses = (status: string): string => {
  const classes = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    failed: 'bg-gray-100 text-gray-800'
  };
  
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status: string): string => {
  const statusMap = {
    paid: 'Payé',
    pending: 'En attente',
    overdue: 'En retard',
    failed: 'Échoué'
  };
  
  return statusMap[status as keyof typeof statusMap] || status;
};

const getAmountClass = (amount: number): string => {
  return amount >= 0 ? 'text-green-600' : 'text-red-600';
};
</script>
