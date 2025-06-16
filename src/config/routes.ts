import { RouteRecordRaw } from 'vue-router';

type RouteConfig = {
  [key: string]: {
    title: string;
    subtitle: string;
    requiresAuth: boolean;
    allowedRoles?: string[];
  };
};

export const routeConfig: RouteConfig = {
  'admin-dashboard': {
    title: 'Tableau de bord',
    subtitle: 'Bienvenue sur votre espace administrateur',
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  'admin-users': {
    title: 'Gestion des utilisateurs',
    subtitle: 'Gérez les utilisateurs de la plateforme',
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  'admin-properties': {
    title: 'Gestion des propriétés',
    subtitle: 'Consultez et gérez toutes les propriétés',
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  'admin-contracts': {
    title: 'Contrats',
    subtitle: 'Gérez les contrats de location',
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  'admin-payments': {
    title: 'Paiements',
    subtitle: 'Suivi des paiements et des transactions',
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  'admin-taxes': {
    title: 'Taxes',
    subtitle: 'Gestion des taxes et impôts',
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  'admin-complaints': {
    title: 'Plaintes',
    subtitle: 'Gestion des réclamations',
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  'agent-dashboard': {
    title: 'Tableau de bord',
    subtitle: 'Bienvenue sur votre espace agent',
    requiresAuth: true,
    allowedRoles: ['agent']
  },
  'agent-properties': {
    title: 'Propriétés',
    subtitle: 'Gérez votre portefeuille immobilier',
    requiresAuth: true,
    allowedRoles: ['agent']
  },
  'agent-clients': {
    title: 'Clients',
    subtitle: 'Gérez vos relations clients',
    requiresAuth: true,
    allowedRoles: ['agent']
  },
  'agent-commission': {
    title: 'Commission',
    subtitle: 'Suivez vos commissions',
    requiresAuth: true,
    allowedRoles: ['agent']
  },
  'tenant-dashboard': {
    title: 'Tableau de bord',
    subtitle: 'Bienvenue sur votre espace locataire',
    requiresAuth: true,
    allowedRoles: ['tenant']
  },
  'tenant-properties': {
    title: 'Mon logement',
    subtitle: 'Informations sur votre location',
    requiresAuth: true,
    allowedRoles: ['tenant']
  },
  'tenant-payments': {
    title: 'Paiements',
    subtitle: 'Gérez vos paiements de loyer',
    requiresAuth: true,
    allowedRoles: ['tenant']
  },
  'tenant-complaints': {
    title: 'Signaler un problème',
    subtitle: 'Faites-nous part de vos problèmes',
    requiresAuth: true,
    allowedRoles: ['tenant']
  },
  'landlord-dashboard': {
    title: 'Tableau de bord',
    subtitle: 'Bienvenue sur votre espace propriétaire',
    requiresAuth: true,
    allowedRoles: ['landlord']
  },
  'landlord-properties': {
    title: 'Mes propriétés',
    subtitle: 'Gérez vos biens immobiliers',
    requiresAuth: true,
    allowedRoles: ['landlord']
  },
  'landlord-profile': {
    title: 'Mon profil',
    subtitle: 'Gérez votre profil propriétaire',
    requiresAuth: true,
    allowedRoles: ['landlord']
  },
  'landlord-custom-options': {
    title: 'Options personnalisées',
    subtitle: 'Gérez vos options personnalisées',
    requiresAuth: true,
    allowedRoles: ['landlord']
  },
  'landlord-tenants': {
    title: 'Mes locataires',
    subtitle: 'Gérez vos relations avec les locataires',
    requiresAuth: true,
    allowedRoles: ['landlord']
  },
  'landlord-payments': {
    title: 'Paiements',
    subtitle: 'Suivez vos revenus locatifs',
    requiresAuth: true,
    allowedRoles: ['landlord']
  },
  'landlord-maintenance': {
    title: 'Maintenance',
    subtitle: "Gérez l'entretien de vos biens",
    requiresAuth: true,
    allowedRoles: ['landlord']
  },
  'landlord-documents': {
    title: 'Documents',
    subtitle: 'Gérez vos documents',
    requiresAuth: true,
    allowedRoles: ['landlord']
  },
  'landlord-calendar': {
    title: 'Calendrier',
    subtitle: 'Consultez votre calendrier',
    requiresAuth: true,
    allowedRoles: ['landlord']
  },
  'login': {
    title: 'Connexion',
    subtitle: 'Accédez à votre compte',
    requiresAuth: false
  },
  'register': {
    title: 'Inscription',
    subtitle: 'Créez votre compte',
    requiresAuth: false
  },
  'forgot-password': {
    title: 'Mot de passe oublié',
    subtitle: 'Réinitialisez votre mot de passe',
    requiresAuth: false
  }
};

// Fonction utilitaire pour obtenir la route de redirection par défaut selon le type d'utilisateur
export function getDefaultRouteForRole(userType?: string): string {
  switch (userType) {
    case 'admin':
      return '/admin/dashboard';
    case 'agent':
      return '/agent/dashboard';
    case 'landlord':
      return '/landlord/dashboard';
    case 'tenant':
      return '/tenant/dashboard';
    default:
      return '/login';
  }
}

// Fonction utilitaire pour obtenir le nom de la route par défaut selon le type d'utilisateur
export function getDefaultRouteNameForRole(userType?: string): string {
  switch (userType) {
    case 'admin':
      return 'admin-dashboard';
    case 'agent':
      return 'agent-dashboard';
    case 'landlord':
      return 'landlord-dashboard';
    case 'tenant':
      return 'tenant-dashboard';
    default:
      return 'login';
  }
}

// Fonction pour vérifier si un utilisateur a accès à une route
export function hasAccessToRoute(routeName: string, userType?: string): boolean {
  const route = routeConfig[routeName];
  if (!route) return false;
  
  // Si la route ne nécessite pas d'authentification, l'accès est accordé
  if (!route.requiresAuth) return true;
  
  // Si l'utilisateur n'est pas connecté, refuser l'accès
  if (!userType) return false;
  
  // Si la route n'a pas de rôles spécifiés, l'accès est accordé à tout utilisateur connecté
  if (!route.allowedRoles) return true;
  
  // Vérifier si le type d'utilisateur est autorisé
  return route.allowedRoles.includes(userType);
}
