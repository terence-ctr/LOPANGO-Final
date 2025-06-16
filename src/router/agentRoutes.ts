import DashboardLayout from '@/layouts/DashboardLayout.vue';

// Vues de l'agent
import DashboardView from '@/views/agent/DashboardView.vue';
import ClientsView from '@/views/agent/ClientsView.vue';
import CommissionView from '@/views/agent/CommissionView.vue';
import PropertiesView from '@/views/agent/PropertiesView.vue';

export const agentRoutes = [
  {
    path: '/agent',
    component: DashboardLayout,
    meta: { requiresAuth: true, userType: 'agent' },
    children: [
      {
        path: 'dashboard',
        name: 'agent-dashboard',
        component: DashboardView,
        meta: { title: 'Tableau de bord - Agent' }
      },
      {
        path: 'clients',
        name: 'agent-clients',
        component: ClientsView,
        meta: { title: 'Gestion des clients' }
      },
      {
        path: 'commission',
        name: 'agent-commission',
        component: CommissionView,
        meta: { title: 'Suivi des commissions' }
      },
      {
        path: 'properties',
        name: 'agent-properties',
        component: PropertiesView,
        meta: { title: 'Gestion des biens' }
      },
      {
        path: 'appointments',
        name: 'agent-appointments',
        component: () => import('@/views/agent/AppointmentsView.vue'), // TODO: Créer ce composant
        meta: { title: 'Rendez-vous' }
      },
      {
        path: 'profile',
        name: 'agent-profile',
        component: () => import('@/views/agent/ProfileView.vue'), // TODO: Créer ce composant
        meta: { title: 'Mon profil' }
      }
    ]
  }
];
