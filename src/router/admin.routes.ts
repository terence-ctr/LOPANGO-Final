import { RouteRecordRaw } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';

// Vues d'administration
import AdminDashboard from '../views/admin/DashboardView.vue';
import AdminUsers from '../views/admin/UsersView.vue';
import AdminProperties from '../views/admin/PropertiesView.vue';
import AdminContracts from '../views/admin/ContractsView.vue';
import AdminPayments from '../views/admin/PaymentsView.vue';
import AdminTaxes from '../views/admin/TaxesView.vue';
import AdminComplaints from '../views/admin/ComplaintsView.vue';

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: DashboardLayout,
    meta: { 
      requiresAuth: true,
      roles: ['admin']
    },
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: { 
          title: 'Tableau de bord',
          subtitle: 'Bienvenue sur votre espace administrateur'
        }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: AdminUsers,
        meta: { 
          title: 'Utilisateurs',
          subtitle: 'Gérez les utilisateurs de la plateforme'
        }
      },
      {
        path: 'properties',
        name: 'admin-properties',
        component: AdminProperties,
        meta: { 
          title: 'Propriétés',
          subtitle: 'Gérez toutes les propriétés'
        }
      },
      {
        path: 'contracts',
        name: 'admin-contracts',
        component: AdminContracts,
        meta: { 
          title: 'Contrats',
          subtitle: 'Gérez les contrats de location'
        }
      },
      {
        path: 'payments',
        name: 'admin-payments',
        component: AdminPayments,
        meta: { 
          title: 'Paiements',
          subtitle: 'Suivi des paiements et des transactions'
        }
      },
      {
        path: 'taxes',
        name: 'admin-taxes',
        component: AdminTaxes,
        meta: { 
          title: 'Taxes',
          subtitle: 'Gestion des taxes et impôts'
        }
      },
      {
        path: 'complaints',
        name: 'admin-complaints',
        component: AdminComplaints,
        meta: { 
          title: 'Plaintes',
          subtitle: 'Gestion des réclamations'
        }
      },
      // Redirection par défaut pour /admin vers /admin/dashboard
      {
        path: '',
        redirect: { name: 'admin-dashboard' }
      },
      // Gestion des sous-routes non trouvées
      {
        path: ':pathMatch(.*)*',
        redirect: { name: 'admin-dashboard' }
      }
    ]
  }
];

export default adminRoutes;
