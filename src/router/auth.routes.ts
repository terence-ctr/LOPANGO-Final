import { RouteRecordRaw } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';

// Vues d'authentification
import LoginPage from '../views/auth/LoginPage.vue';
import RegisterPage from '../views/auth/RegisterPage.vue';
import ForgotPassword from '../views/auth/ForgotPassword.vue';
import ResetPassword from '../views/auth/ResetPassword.vue';
import VerifyEmail from '../views/auth/VerifyEmail.vue';

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: AuthLayout,
    meta: { 
      requiresAuth: false,
      guestOnly: true
    },
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginPage,
        meta: { 
          title: 'Connexion',
          subtitle: 'Accédez à votre espace personnel'
        }
      },
      {
        path: 'register',
        name: 'register',
        component: RegisterPage,
        meta: { 
          title: 'Inscription',
          subtitle: 'Créez votre compte en quelques étapes simples'
        }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPassword,
        meta: { 
          title: 'Mot de passe oublié',
          subtitle: 'Réinitialisez votre mot de passe en toute sécurité'
        }
      },
      {
        path: 'reset-password/:token',
        name: 'reset-password',
        component: ResetPassword,
        props: true,
        meta: { 
          title: 'Réinitialisation du mot de passe',
          subtitle: 'Définissez un nouveau mot de passe sécurisé'
        }
      },
      {
        path: 'verify-email/:token',
        name: 'verify-email',
        component: VerifyEmail,
        props: true,
        meta: { 
          title: 'Vérification de l\'email',
          subtitle: 'Validation de votre adresse email'
        }
      },
      // Redirection par défaut pour /auth vers /auth/login
      {
        path: '',
        redirect: { name: 'login' }
      },
      // Gestion des sous-routes non trouvées
      {
        path: ':pathMatch(.*)*',
        redirect: { name: 'login' }
      }
    ]
  },
  // Redirection de /login vers /auth/login (pour la rétrocompatibilité)
  {
    path: '/login',
    redirect: { name: 'login' }
  },
  {
    path: '/register',
    redirect: { name: 'register' }
  },
  {
    path: '/forgot-password',
    redirect: { name: 'forgot-password' }
  }
];

export default authRoutes;
