import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ClickOutside from '@/directives/click-outside'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import tooltipDirective from '@/directives/tooltip'
import '@/plugins/fontawesome' // Import pour ajouter les icônes à la bibliothèque
import App from './App.vue'
import router from './router'
import './style.css'
import './assets/css/tailwind.css'

// Sauvegarder les méthodes d'origine
const originalWarn = console.warn;
const originalError = console.error;
const originalInfo = console.info || console.log;

// Intercepter console.info pour filtrer les messages Suspense
console.info = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('<Suspense>') || 
       message.includes('experimental feature'))) {
    return;
  }
  originalInfo.apply(console, args);
};

// Intercepter console.warn pour filtrer les messages indésirables
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('<Suspense>') || 
       message.includes('experimental feature'))) {
    return;
  }
  originalWarn.apply(console, args);
};

// Intercepter console.error pour filtrer les messages en production
console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('<Suspense>') || 
       message.includes('experimental feature'))) {
    return;
  }
  if (import.meta.env.PROD) return;
  originalError.apply(console, args);
};

const app = createApp(App)

// Utiliser Pinia pour la gestion d'état
const pinia = createPinia()
app.use(pinia)

// Utiliser le routeur
app.use(router)

// Utiliser le plugin de mouvement
app.use(MotionPlugin)

// Configuration du routeur pour gérer le défilement
router.beforeEach((to, from, next) => {
  // Faire défiler vers le haut de la page lors du changement de route
  window.scrollTo(0, 0);
  next();
});

// Enregistrer le composant FontAwesomeIcon globalement
app.component('FontAwesomeIcon', FontAwesomeIcon)

// Enregistrer la directive click-outside globalement
app.directive('click-outside', ClickOutside);

// Enregistrer la directive de tooltip personnalisée
app.directive('tooltip', tooltipDirective);

// Configuration de vue3-toastify
const toastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 60,
  progress: undefined,
  theme: 'light'
};

// Fournir toast comme une propriété globale
app.provide('toast', toast);
app.provide('toastOptions', toastOptions);

app.mount('#app')