<template>
  <div class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-bold text-base">Vos paiements récents</h2>
      <button 
        v-if="payments.length > 0"
        aria-label="Voir tous" 
        class="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none flex items-center gap-1"
        type="button"
        @click="viewAllPayments"
      >
        Voir tout <i class="fas fa-arrow-right text-xs"></i>
      </button>
    </div>
    
    <div v-if="isLoading" class="p-4 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-2 text-sm text-gray-600">Chargement des paiements...</p>
    </div>
    
    <div v-else-if="error" class="p-4 text-center text-red-600">
      <p>{{ error }}</p>
      <button 
        @click="fetchRecentPayments" 
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
      >
        Réessayer
      </button>
    </div>
    
    <div v-else-if="payments.length === 0" class="p-4 text-center text-gray-500">
      <p>Aucun paiement récent</p>
    </div>
    
    <div v-else class="overflow-hidden rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propriété</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garantie utilisée</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(payment, index) in payments" :key="payment.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ payment.property }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ formatAmount(payment.amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-100 text-green-800': !payment.usedGuarantee,
                  'bg-red-100 text-red-800': payment.usedGuarantee
                }"
              >
                {{ payment.usedGuarantee ? 'Oui' : 'Non' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(payment.paymentDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button class="text-blue-600 hover:text-blue-900 mr-3">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardService, { type Payment } from '@/services/dashboard.service';

const payments = ref<Payment[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchRecentPayments = async () => {
  try {
    isLoading.value = true;
    const data = await DashboardService.getRecentPayments({ limit: 5 });
    payments.value = data;
  } catch (err) {
    console.error('Erreur lors du chargement des paiements récents:', err);
    error.value = 'Impossible de charger les paiements récents';
  } finally {
    isLoading.value = false;
  }
};

// Formatage du montant
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Formatage de la date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Charger les données au montage du composant
onMounted(() => {
  fetchRecentPayments();
});

const viewAllPayments = () => {
  // Implémentez la navigation vers la page complète des paiements
  console.log('View all payments');
};
</script>
