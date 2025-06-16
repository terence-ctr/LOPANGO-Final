import DashboardLayout from '../layouts/DashboardLayout.vue';

export const tenantRoutes = [
  {
    path: '/tenant',
    component: DashboardLayout,
    meta: { requiresAuth: true, userType: 'tenant' },
    children: [
      {
        path: 'dashboard',
        name: 'tenant-dashboard',
        component: () => import('@/views/tenant/DashboardView.vue'),
        meta: { title: 'Tableau de bord - Locataire' }
      },
      {
        path: 'contracts',
        name: 'tenant-contracts',
        component: () => import('@/views/tenant/ContractsView.vue'),
        meta: { title: 'Mes contrats' }
      },
      {
        path: 'properties',
        name: 'tenant-properties',
        component: () => import('@/views/tenant/PropertiesView.vue'),
        meta: { title: 'Mes biens' }
      },
      {
        path: 'payments',
        name: 'tenant-payments',
        component: () => import('@/views/tenant/PaymentsView.vue'),
        meta: { title: 'Mes paiements' }
      },
      {
        path: 'complaints',
        name: 'tenant-complaints',
        component: () => import('@/views/tenant/ComplaintsView.vue'),
        meta: { title: 'Mes réclamations' }
      },
      {
        path: 'profile',
        name: 'tenant-profile',
        component: () => import('@/views/tenant/ProfileView.vue'),
        meta: { title: 'Mon profil' }
      }
    ]
  }
];
