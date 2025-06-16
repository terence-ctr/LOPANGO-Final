<template>
  <div class="bg-white text-gray-900 p-6 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <DashboardHeader 
        :user="user"
        :has-notifications="hasUnreadAlerts"
      />

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

        <!-- Alerts Card -->
        <AlertsCard 
          class="max-w-sm mx-auto lg:mx-0"
          :alerts="alerts"
          @view-all="navigateToAlerts"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// Components
import DashboardHeader from '@/components/tenant/dashboard/Header.vue';
import PropertiesCard from '@/components/tenant/dashboard/PropertiesCard.vue';
import CalendarCard from '@/components/tenant/dashboard/CalendarCard.vue';
import RecentPayments from '@/components/tenant/dashboard/RecentPayments.vue';
import AlertsCard from '@/components/tenant/dashboard/AlertsCard.vue';

const router = useRouter();

// User data
const user = ref({
  name: 'Landry',
  avatar: 'https://storage.googleapis.com/a1aa/image/5bb1daec-b496-4707-fc45-504b0cbab117.jpg'
});

// Properties data
const properties = ref([
  { id: 1, name: 'Appartement B20', status: 'active' },
  { id: 2, name: 'Appartement B10', status: 'active' }
]);

// Recent payments data
const recentPayments = ref([
  { 
    id: 1, 
    property: 'Appartement B20', 
    amount: '450$', 
    usedGuarantee: false, 
    date: '30/03/2024' 
  },
  { 
    id: 2, 
    property: 'Appartement B20', 
    amount: '450$', 
    usedGuarantee: false, 
    date: '30/02/2024' 
  },
  { 
    id: 3, 
    property: 'Appartement B20', 
    amount: '450$', 
    usedGuarantee: true, 
    date: '30/01/2024' 
  },
  { 
    id: 4, 
    property: 'Appartement B20', 
    amount: '450$', 
    usedGuarantee: false, 
    date: '30/12/2023' 
  },
  { 
    id: 5, 
    property: 'Appartement B20', 
    amount: '450$', 
    usedGuarantee: false, 
    date: '30/11/2023' 
  }
]);

// Alerts data
const alerts = ref([
  { 
    id: 1, 
    tenant: 'Marcel Senga', 
    message: ' a dépassé son ultimatum de loyer.',
    type: 'error' as const,
    timestamp: new Date(Date.now() - 3600000 * 2)
  },
  { 
    id: 2, 
    tenant: 'Marcel Senga', 
    message: ' est très proche de son ultimatum de loyer',
    type: 'warning' as const,
    timestamp: new Date(Date.now() - 86400000)
  },
  { 
    id: 3, 
    tenant: 'Jason Isamene', 
    message: ' est très proche de son ultimatum de loyer',
    type: 'warning' as const,
    timestamp: new Date(Date.now() - 172800000)
  },
  { 
    id: 4, 
    tenant: 'Elie Oko', 
    message: ' est très proche de son ultimatum de loyer',
    type: 'warning' as const,
    timestamp: new Date(Date.now() - 259200000)
  }
]);

// Computed
const hasUnreadAlerts = computed(() => {
  return alerts.value.some(alert => !alert.read);
});

// Methods
const navigateToAlerts = () => {
  router.push('/tenant/alerts');
};
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
