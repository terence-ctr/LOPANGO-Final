<template>
  <div class="bg-white text-gray-900 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Main content grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Properties Card -->
        <PropertiesCard 
          class="lg:col-span-2"
          :properties="properties"
        />

        <!-- Calendar Card -->
        <CalendarCard 
          class="max-w-sm mx-auto lg:mx-0"
          :initial-date="new Date()"
        />

        <!-- Recent Payments -->
        <RecentPayments 
          class="lg:col-span-2"
          :payments="recentPayments"
        />

        <!-- Space for future components -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardService from '@/services/dashboard.service';

// Components
import PropertiesCard from '@/components/tenant/dashboard/PropertiesCard.vue';
import CalendarCard from '@/components/tenant/dashboard/CalendarCard.vue';
import RecentPayments from '@/components/tenant/dashboard/RecentPayments.vue';
// Utils
import { convertMockPaymentToPayment } from '@/utils/converters';

// Mocks
import { 
  fetchMockProperties, 
  fetchMockRecentPayments 
} from '@/__mocks__/dashboard.mock';

// Types
import type { Payment } from '@/types/payment';

const router = useRouter();

// Types
import type { MockProperty, MockPayment } from '@/__mocks__';

// States
const properties = ref<MockProperty[]>([]);
const mockPayments = ref<MockPayment[]>([]);
const recentPayments = computed<Payment[]>(() => 
  mockPayments.value.map(convertMockPaymentToPayment)
);
const loading = ref(false);
const error = ref('');

const fetchDashboardData = async () => {
  loading.value = true;
  error.value = '';

  try {
    // Récupérer les propriétés
    console.log('[Dashboard] Récupération des propriétés...');
    properties.value = await fetchMockProperties();
    console.log('[Dashboard] Propriétés récupérées:', properties.value);
    
    // Récupérer les paiements récents
    console.log('[Dashboard] Récupération des paiements récents...');
    mockPayments.value = await fetchMockRecentPayments();
    console.log('[Dashboard] Paiements récents récupérés:', mockPayments.value);
  } catch (err) {
    console.error('Erreur lors de la récupération des données du tableau de bord:', err);
    error.value = 'Impossible de charger les données du tableau de bord. Veuillez réessayer.';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  console.log('[Dashboard] Chargement du tableau de bord locataire...');
  await fetchDashboardData();
  console.log('[Dashboard] Chargement terminé.');
});
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
