import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Import des composants communs
import DashboardView from '../views/DashboardView.vue';
import ProfileView from '../views/ProfileView.vue';
import SettingsView from '../views/SettingsView.vue';
import HelpView from '../views/HelpView.vue';
import AboutView from '../views/AboutView.vue';

// Import des composants d'erreur
import NotFoundView from '@/views/errors/NotFoundPage.vue';
import ErrorView from '@/views/errors/ErrorPage.vue';

// Import du composant de paiement
import PaymentPage from '@/views/payments/PaymentPage.vue';

export const commonRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
      title: 'Tableau de bord',
      subtitle: 'Bienvenue sur votre espace',
    },
  },
  {
    path: '/payment/:paymentId',
    name: 'payment',
    component: PaymentPage,
    meta: {
      requiresAuth: true,
      title: 'Paiement sécurisé',
      subtitle: 'Effectuez votre paiement en toute sécurité',
      roles: ['tenant', 'landlord'] // Accessible aux locataires et propriétaires
    },
    props: true // Passe les paramètres de route en tant que props
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      requiresAuth: true,
      title: 'Mon profil',
      subtitle: 'Gérer vos informations personnelles',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      requiresAuth: true,
      title: 'Paramètres',
      subtitle: 'Configurer votre compte',
    },
  },
  {
    path: '/help',
    name: 'help',
    component: HelpView,
    meta: {
      requiresAuth: true,
      title: 'Aide',
      subtitle: 'Centre d\'aide et support',
    },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: {
      requiresAuth: true,
      title: 'À propos',
      subtitle: 'À propos de l\'application',
    },
  },
];

// Routes d'erreur
export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Page non trouvée',
    },
  },
  {
    path: '/error',
    name: 'error',
    component: ErrorView,
    meta: {
      title: 'Erreur',
    },
  },
];

// Définition du type pour les métadonnées de route
interface RouteMeta {
  requiresAuth?: boolean;
  title?: string;
  subtitle?: string;
  roles?: string[];
  [key: string]: any; // Permet d'autres propriétés optionnelles
}

// Fonction pour vérifier l'accès à une route
export const canAccessRoute = (route: RouteRecordRaw, userRole: string): boolean => {
  const authStore = useAuthStore();
  const meta = route.meta as RouteMeta | undefined;
  
  // Toutes les routes communes nécessitent une authentification
  if (meta?.requiresAuth && !authStore.isAuthenticated) {
    return false;
  }

  // Vérifier les rôles autorisés si spécifiés
  if (meta?.roles && Array.isArray(meta.roles) && meta.roles.length > 0) {
    return meta.roles.includes(userRole);
  }

  return true;
};
