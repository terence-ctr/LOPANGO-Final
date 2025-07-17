<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900">
    <!-- Main content -->
    <main class="flex-1 p-4 md:p-6 lg:p-8 max-w-full overflow-x-auto">
      <div class="max-w-7xl mx-auto">
        <!-- En-tête -->
        <div class="mb-6 md:mb-8">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p class="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        
        <!-- Stats cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard 
            iconClass="fas fa-user-tie"
            :value="loading ? '...' : dashboardData.stats.landlords"
            label="Bailleurs"
            description="Bailleurs actifs"
          />
          <StatsCard 
            iconClass="fas fa-user"
            :value="loading ? '...' : dashboardData.stats.tenants"
            label="Locataires"
            description="Locataires uniques"
          />
          <StatsCard 
            iconClass="fas fa-home"
            :value="loading ? '...' : dashboardData.stats.properties"
            label="Propriétés"
            description="Propriétés gérées"
          />
          <StatsCard 
            iconClass="fas fa-file-contract"
            :value="loading ? '...' : dashboardData.stats.contracts"
            label="Contrats actifs"
            description="Contrats en cours"
          />
        </div>
        
        <!-- Message d'erreur -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-circle text-red-500"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Côté gauche : Transactions récentes -->
          <div class="flex-1">
            <div class="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Transactions récentes</h2>
              <TransactionsTable :transactions="dashboardData.recentTransactions" />
            </div>
          </div>
          
          <!-- Côté droit : Calendrier et Alertes -->
          <aside class="w-full lg:w-96 flex flex-col gap-6">
            <div class="bg-white rounded-lg shadow p-4 md:p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Calendrier</h2>
              <Calendar />
            </div>
            
            <div class="bg-white rounded-lg shadow p-4 md:p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Alertes</h2>
              <Alerts :alerts="dashboardData.alerts" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import StatsCard from '@/components/agent/StatsCard.vue';
import TransactionsTable from '@/components/agent/TransactionsTable.vue';
import Calendar from '@/components/agent/Calendar.vue';
import Alerts from '@/components/agent/Alerts.vue';
import { api } from '@/config/axios';
import { apiConfig } from '@/config/api.config';

// Types pour les données du tableau de bord
interface DashboardStats {
  landlords: number;
  tenants: number;
  properties: number;
  contracts: number;
  [key: string]: number;
}

interface Transaction {
  id: number;
  property: string;
  amount: string;
  guarantee: boolean;
  date: string;
  type: string;
  status: string;
  [key: string]: any;
}

interface Alert {
  id: number;
  name: string;
  message: string;
  type: string;
  colorClass: string;
  [key: string]: any;
}

interface DashboardData {
  stats: DashboardStats;
  recentTransactions: Array<Transaction & { [key: string]: any }>;
  upcomingEvents: any[];
  alerts: (Alert & { type: string; message: string })[];
  [key: string]: any;
}

// Références réactives pour les données
const loading = ref(true);
const error = ref('');
const dashboardData = ref<DashboardData>({
  stats: {
    landlords: 0,
    tenants: 0,
    properties: 0,
    contracts: 0,
    totalProperties: 0,
    activeContracts: 0,
    pendingPayments: 0,
    totalTenants: 0
  },
  recentTransactions: [],
  upcomingEvents: [],
  alerts: []
});

const router = useRouter();

// Fonction pour charger les données du tableau de bord
const loadDashboardData = async () => {
  try {
    console.log('[DashboardView] Début du chargement des données du tableau de bord...');
    loading.value = true;
    error.value = '';
    
    // Récupérer les données du tableau de bord depuis l'API
    const response = await api.get('/dashboard/agent');
    console.log('Réponse du serveur:', response.data);
    
    // Mettre à jour les données réactives avec la réponse du serveur
    if (response.data) {
      const data = response.data.data || response.data; // Gérer les deux formats de réponse
      
      dashboardData.value = {
        stats: {
          // Données principales
          landlords: data.totalLandlords || 0,
          tenants: data.totalTenants || 0,
          properties: data.totalProperties || 0,
          contracts: data.activeContracts || 0,
          
          // Données complémentaires (pour référence)
          totalLandlords: data.totalLandlords || 0,
          totalTenants: data.totalTenants || 0,
          totalProperties: data.totalProperties || 0,
          activeContracts: data.activeContracts || 0,
          pendingPayments: 0 // À implémenter si nécessaire
        },
        recentTransactions: data.recentTransactions || [],
        upcomingEvents: data.upcomingVisits || [],
        alerts: [] // Les alertes seront gérées séparément
      };
      
      console.log('Données du tableau de bord mises à jour:', dashboardData.value);
    }
    
  } catch (err: any) {
    console.error('[DashboardView] Erreur lors du chargement des données:', {
      error: err,
      response: err.response?.data,
      status: err.response?.status
    });
    
    // Gestion des erreurs
    if (err.response) {
      if (err.response.status === 401 || err.response.status === 403) {
        error.value = 'Votre session a expiré. Vous allez être redirigé vers la page de connexion...';
        setTimeout(() => {
          router.push({ name: 'login', query: { session: 'expired' } });
        }, 2000);
        return;
      }
      
      error.value = `Erreur serveur (${err.response.status}): ${err.response.data?.message || 'Veuillez réessayer plus tard.'}`;
    } else if (err.request) {
      error.value = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
    } else {
      error.value = `Erreur lors de la configuration de la requête: ${err.message}`;
    }
    
    // Valeurs par défaut en cas d'erreur
    dashboardData.value = {
      stats: {
        landlords: 0,
        tenants: 0,
        properties: 0,
        contracts: 0,
        totalProperties: 0,
        activeContracts: 0,
        pendingPayments: 0,
        totalTenants: 0
      },
      recentTransactions: [],
      upcomingEvents: [],
      alerts: []
    };
  } finally {
    loading.value = false;
  }
};

// Charger les données au montage du composant
onMounted(() => {
  loadDashboardData();
});

// Computed properties basées sur les données du tableau de bord
const nbBailleurs = computed(() => dashboardData.value.stats.landlords);
const nbLocataires = computed(() => dashboardData.value.stats.tenants);
const nbProprietesAvecAgent = computed(() => dashboardData.value.stats.properties);
const transactions = computed(() => dashboardData.value.recentTransactions);
const alerts = computed(() => dashboardData.value.alerts);

// Données pour le calendrier
interface CalendarEvent {
  id: number | string;
  title: string;
  start: string;
  end: string;
  color: string;
  [key: string]: any;
}

const calendarEvents = ref<CalendarEvent[]>([
  {
    id: 1,
    title: 'Visite propriété',
    start: '2023-11-10',
    end: '2023-11-10',
    color: 'blue'
  },
  {
    id: 2,
    title: 'Signature contrat',
    start: '2023-11-15',
    end: '2023-11-15',
    color: 'green'
  }
]);

// Charger les données au montage du composant
onMounted(() => {
  console.log('[DashboardView] Composant monté, chargement des données...');
  loadDashboardData();
});

// Log quand les données sont mises à jour
watch(dashboardData, (newData: DashboardData) => {
  console.log('[DashboardView] Données du tableau de bord mises à jour:', {
    stats: newData.stats,
    transactionsCount: newData.recentTransactions?.length,
    alertsCount: newData.alerts?.length
  });
}, { deep: true });

// Les transactions et alertes sont maintenant gérées via les données du tableau de bord
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
