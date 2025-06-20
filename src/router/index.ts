import { createRouter, createWebHistory, type RouteRecordRaw, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { routeConfig, hasAccessToRoute, getDefaultRouteForRole } from '../config/routes';

// Layouts
import DefaultLayout from '../layouts/DefaultLayout.vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

// Vues de base
import NotFoundPage from '../views/errors/NotFoundPage.vue';
import UnauthorizedPage from '../views/errors/UnauthorizedPage.vue';

// Routes modulaires
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import { tenantRoutes } from './tenantRoutes';
import { agentRoutes } from './agentRoutes';
import { landlordRoutes } from './landlordRoutes';

// Vérifier que les routes sont bien chargées
console.log('Routes chargées:', {
  auth: authRoutes.length,
  admin: adminRoutes.length,
  tenant: tenantRoutes.length,
  agent: agentRoutes.length,
  landlord: landlordRoutes.length
});

// Vérifier les autorisations d'accès à une route
const checkRouteAccess = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  const routeName = to.name?.toString();
  
  // Si la route n'existe pas, rediriger vers la page 404
  if (!routeName || !routeConfig[routeName]) {
    next({ name: 'not-found' });
    return;
  }

  const routeInfo = routeConfig[routeName];
  const userRole = authStore.user?.role;
  
  // Vérifier si l'utilisateur a accès à la route
  const hasAccess = hasAccessToRoute(routeName, userRole);
  
  if (!hasAccess) {
    if (authStore.isAuthenticated) {
      // Si l'utilisateur est connecté mais n'a pas les droits
      next({ name: 'unauthorized' });
    } else {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      next({ 
        name: 'login', 
        query: { 
          redirect: to.fullPath,
          reason: 'auth-required'
        } 
      });
    }
    return;
  }
  
  // Si tout est bon, continuer la navigation
  next();
};

// Ancienne fonction createDashboardRoute supprimée car non utilisée

const routes: RouteRecordRaw[] = [
  // Redirection de la racine vers la page de connexion
  {
    path: '/',
    redirect: { name: 'login' }
  },
  // Routes d'authentification
  ...authRoutes,
  
  // Routes protégées par type d'utilisateur
  ...tenantRoutes,
  ...adminRoutes,
  ...agentRoutes,
  ...landlordRoutes,
  
  // Redirections pour les anciennes URL
  {
    path: '/tenant',
    redirect: { name: 'tenant-dashboard' }
  },
  {
    path: '/admin',
    redirect: { name: 'admin-dashboard' }
  },
  {
    path: '/agent',
    redirect: { name: 'agent-dashboard' }
  },
  {
    path: '/landlord',
    redirect: { name: 'landlord-dashboard' }
  },
  
  // Routes publiques
  // Routes d'erreur
  {
    path: '/404',
    name: 'not-found',
    component: NotFoundPage,
    meta: { title: 'Page non trouvée' }
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedPage,
    meta: { title: 'Non autorisé' }
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: () => import('../views/errors/MaintenancePage.vue'),
    meta: { 
      title: 'Maintenance en cours',
      subtitle: 'Nous effectuons des travaux de maintenance. Veuillez réessayer ultérieurement.'
    }
  },
  
  // Redirection des routes inconnues vers la page 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  }
});

// Garde de navigation globale
router.beforeEach(async (to, from, next) => {
  console.log('Navigation de:', from.path, 'vers:', to.path);
  const authStore = useAuthStore();
  
  // Ignorer la vérification pour les routes d'erreur et de maintenance
  if (to.name === 'unauthorized' || to.name === 'not-found' || to.name === 'maintenance') {
    console.log('Route spéciale détectée, accès direct');
    next();
    return;
  }
  
  // Si l'utilisateur est déjà sur une page protégée, sauvegarder l'URL pour redirection après login
  const isProtectedRoute = to.matched.some(record => record.meta.requiresAuth);
  if (isProtectedRoute && !authStore.isAuthenticated) {
    // Ne pas sauvegarder pour les routes d'API ou les routes spéciales
    const isApiRoute = to.path.startsWith('/api');
    const isAuthRoute = ['login', 'register', 'forgot-password'].includes(to.name as string);
    
    if (!isApiRoute && !isAuthRoute) {
      const redirectPath = to.fullPath;
      console.log('Sauvegarde de la redirection après login:', redirectPath);
      localStorage.setItem('redirectAfterLogin', redirectPath);
    }
  }
  
  // Vérifier l'authentification uniquement si nécessaire
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isGuestOnly = to.matched.some(record => record.meta.guestOnly);
  
  console.log('Vérification d\'authentification nécessaire:', { requiresAuth, isGuestOnly });
  
  try {
    if (requiresAuth || isGuestOnly) {
      console.log('Vérification de l\'authentification...');
      await authStore.checkAuth();
    }
    
    // Si la route nécessite une authentification et que l'utilisateur n'est pas connecté
    if (requiresAuth && !authStore.isAuthenticated) {
      console.log('Accès refusé: authentification requise');
      
      // Ne pas sauvegarder pour les routes d'API ou les routes spéciales
      const isApiRoute = to.path.startsWith('/api');
      const isAuthRoute = ['login', 'register', 'forgot-password'].includes(to.name as string);
      
      if (!isApiRoute && !isAuthRoute) {
        const redirectPath = to.fullPath;
        console.log('Sauvegarde de la redirection après login:', redirectPath);
        localStorage.setItem('redirectAfterLogin', redirectPath);
      }
      
      // Vérifier si la session a expiré
      const sessionExpired = to.query.session === 'expired';
      
      next({
        name: 'login',
        query: { 
          ...(sessionExpired ? { session: 'expired' } : {}),
          redirect: to.fullPath !== '/' && !isApiRoute ? to.fullPath : undefined,
          reason: 'auth-required'
        }
      });
      return;
    }
    
    // Si l'utilisateur est connecté et essaie d'accéder à une page de connexion/inscription
    if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
      console.log('Redirection vers le tableau de bord, utilisateur déjà connecté');
      const defaultRoute = getDefaultRouteForRole(authStore.user?.role);
      next(defaultRoute);
      return;
    }
    
    // Redirection pour les utilisateurs authentifiés qui essaient d'accéder à des pages réservées aux invités
    if (isGuestOnly && authStore.isAuthenticated) {
      console.log('Redirection: page réservée aux invités');
      const defaultRoute = getDefaultRouteForRole(authStore.user?.role);
      next(defaultRoute);
      return;
    }
    
    // Vérification des rôles pour les routes protégées
    if (requiresAuth && to.meta.roles) {
      const userType = authStore.user?.userType;
      const requiredRoles = to.meta.roles as string[];
      
      console.log('Vérification des rôles:', { userType, requiredRoles });
      
      if (requiredRoles && requiredRoles.length > 0 && (!userType || !requiredRoles.includes(userType))) {
        console.log('Accès refusé: droits insuffisants');
        next({ name: 'unauthorized' });
        return;
      }
    }
  
    // Mise à jour du titre de la page
    const title = (to.meta.title as string) || 'Application';
    document.title = `${title} | Mon Application`;
    
    next();
  } catch (error) {
    console.error('Erreur lors de la navigation:', error);
    next(false); // Annule la navigation en cas d'erreur
  }
});

// Interface pour les métadonnées des routes
declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    subtitle?: string;
    requiresAuth?: boolean;
    guestOnly?: boolean;
    roles?: string[];
  }
}

export default router;
