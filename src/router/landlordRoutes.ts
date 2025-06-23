import DashboardLayout from '@/layouts/DashboardLayout.vue';
import PropertiesView from '@/views/landlord/PropertiesView.vue';
import PropertyDetailsView from '@/views/landlord/PropertyDetailsView.vue';

export const landlordRoutes = [
  {
    path: '/landlord',
    component: DashboardLayout,
    meta: { requiresAuth: true, userType: 'landlord' },
    children: [
      {
        path: 'dashboard',
        name: 'landlord-dashboard',
        component: () => import('@/views/landlord/DashboardView.vue'),
        meta: { title: 'Tableau de bord - Propriétaire' }
      },
      {
        path: 'properties',
        name: 'landlord-properties',
        component: PropertiesView,
        meta: { title: 'Mes biens' }
      },
      {
        path: 'properties/:id',
        name: 'landlord-property-details',
        component: PropertyDetailsView,
        meta: { title: 'Détails du bien' },
        props: true
      },
      {
        path: 'tenants',
        name: 'landlord-tenants',
        component: () => import('@/views/landlord/TenantsView.vue'),
        meta: { title: 'Mes locataires' }
      },
      {
        path: 'rentals',
        name: 'landlord-rentals',
        component: () => import('@/views/landlord/RentalsView.vue'),
        meta: { title: 'Gestion des locations' }
      },
      {
        path: 'payments',
        name: 'landlord-payments',
        component: () => import('@/views/landlord/PaymentsView.vue'),
        meta: { title: 'Suivi des paiements' }
      },
      {
        path: 'maintenance',
        name: 'landlord-maintenance',
        component: () => import('@/views/CustomOptionsPage.vue'),
        meta: { title: 'Maintenance' }
      },
      {
        path: 'profile',
        name: 'landlord-profile',
        component: () => import('@/views/landlord/ProfileView.vue'), // TODO: Créer ce composant
        meta: { title: 'Mon profil' }
      },
      {
        path: 'custom-options',
        name: 'landlord-custom-options',
        component: () => import('@/views/CustomOptionsPage.vue'),
        meta: { title: 'Options personnalisées' }
      },
      {
        path: 'documents',
        name: 'landlord-documents',
        component: () => import('@/views/CustomOptionsPage.vue'),
        meta: { title: 'Documents' }
      },
      {
        path: 'calendar',
        name: 'landlord-calendar',
        component: () => import('@/views/landlord/CalendarView.vue'),
        meta: { title: 'Calendrier' }
      }
    ]
  }
];
