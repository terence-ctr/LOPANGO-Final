<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="p-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h3 class="text-sm font-medium text-gray-900">Derniers paiements</h3>
        <router-link 
          to="/landlord/payments" 
          class="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          Voir tout
        </router-link>
      </div>
    </div>
    
    <div class="divide-y divide-gray-200">
      <div 
        v-for="payment in recentPayments" 
        :key="payment.id"
        class="p-4 hover:bg-gray-50 transition-colors duration-150"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-900">
              {{ payment.tenantName || 'Locataire' }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatDate(payment.date) }}
            </p>
          </div>
          <div class="text-right">
            <p :class="['text-sm font-medium', getAmountClass(payment.amount)]">
              {{ formatCurrency(payment.amount) }}
            </p>
            <span 
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getStatusClasses(payment.status)
              ]"
            >
              {{ getStatusText(payment.status) }}
            </span>
          </div>
        </div>
        <p v-if="payment.reference" class="mt-1 text-xs text-gray-500 truncate">
          Réf: {{ payment.reference }}
        </p>
      </div>
      
      <div v-if="recentPayments.length === 0" class="p-4 text-center">
        <p class="text-sm text-gray-500">Aucun paiement récent</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Payment } from '@/types/payment';

const recentPayments = ref<Payment[]>([]);

// Données de test (à remplacer par un appel API)
onMounted(() => {
  // Simuler un chargement des données
  setTimeout(() => {
    const now = new Date().toISOString();
    recentPayments.value = [
      {
        id: '1',
        amount: 1200,
        currency: 'EUR',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'paid',
        reference: 'PAY-2023-001',
        tenantId: 't1',
        tenantName: 'Jean Dupont',
        propertyId: '1',
        propertyName: 'Appartement T2',
        createdAt: now,
        updatedAt: now
      },
      {
        id: '2',
        amount: 850,
        currency: 'EUR',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        reference: 'PAY-2023-002',
        tenantId: 't2',
        tenantName: 'Marie Martin',
        propertyId: '2',
        propertyName: 'Studio République',
        createdAt: now,
        updatedAt: now
      }
    ];
  }, 300);
});

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getStatusClasses = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'Payé';
    case 'pending':
      return 'En attente';
    case 'failed':
      return 'Échoué';
    default:
      return status;
  }
};

const getAmountClass = (amount: number): string => {
  return amount >= 0 ? 'text-green-600' : 'text-red-600';
};
</script>
