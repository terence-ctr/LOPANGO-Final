import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Import des composants communs
import DashboardView from '../views/DashboardView.vue';

// Import des composants d'erreur
import NotFoundView from '@/views/NotFoundView.vue';
import ErrorView from '@/views/ErrorView.vue';

// Routes communes accessibles à tous les utilisés authentifiés
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
      subtitle: 'Centre d'aide et support',
    },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: {
      requiresAuth: true,
      title: 'À propos',
      subtitle: 'Informations sur l'application',
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

// Fonction pour vérifier l'accès à une route
export const canAccessRoute = (route: RouteRecordRaw, userRole: string): boolean => {
  const authStore = useAuthStore();
  
  // Toutes les routes communes nécessitent une authentification
  if (route.meta?.requiresAuth && !authStore.isAuthenticated) {
    return false;
  }

  // Vérifier les rôles autorisés si spécifiés
  if (route.meta?.allowedRoles && route.meta.allowedRoles.length > 0) {
    return route.meta.allowedRoles.includes(userRole);
  }

  return true;
};
