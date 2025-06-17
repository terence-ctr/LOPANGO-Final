<template>
  <!-- Barre de navigation supérieure -->
  <header class="bg-white shadow-sm z-10">
    <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
      <!-- Bouton pour afficher/masquer la sidebar (mobile) -->
      <button 
        @click="$emit('toggleSidebar')"
        class="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
        aria-label="Ouvrir le menu"
      >
        <font-awesome-icon :icon="['fas', 'bars']" class="h-6 w-6" />
      </button>
      
      <!-- Titre de la page -->
      <h1 class="text-lg font-medium text-gray-900">
        {{ pageTitle }}
      </h1>
      
      <!-- Menu utilisateur -->
      <div class="flex items-center gap-3">
        <div class="relative">
          <div 
            class="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-100 cursor-pointer user-menu"
            @click="toggleProfileMenu"
            role="button"
            aria-haspopup="true"
            :aria-expanded="isProfileMenuOpen"
          >
            <div 
              v-if="userInitials"
              class="w-8 h-8 min-w-[2rem] rounded-full bg-blue-600 flex items-center justify-center text-white font-medium"
            >
              {{ userInitials }}
            </div>
            <div v-else class="w-8 h-8 min-w-[2rem] rounded-full bg-blue-600 flex items-center justify-center text-white">
              <font-awesome-icon :icon="['fas', 'user']" class="text-sm" />
            </div>
            
            <font-awesome-icon 
              :icon="['fas', 'chevron-down']" 
              class="text-gray-500 text-xs transition-transform duration-200"
              :class="{ 'transform rotate-180': isProfileMenuOpen }"
            />
          </div>
          
          <!-- Menu déroulant utilisateur -->
          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div 
              v-if="isProfileMenuOpen"
              v-click-outside="closeProfileMenu"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
              @click.stop
            >
              <router-link 
                to="/profile"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                @click="closeProfileMenu"
              >
                <font-awesome-icon :icon="['fas', 'user']" class="mr-2" />
                Mon profil
              </router-link>
              <button 
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                role="menuitem"
              >
                <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="mr-2" />
                Déconnexion
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  pageTitle: {
    type: String,
    default: 'Tableau de bord'
  },
  user: {
    type: Object,
    default: () => ({ name: '' })
  }
});

const emit = defineEmits(['toggleSidebar', 'logout']);

const router = useRouter();
const isProfileMenuOpen = ref(false);

// Fermer le menu quand on change de page
router.afterEach(() => {
  isProfileMenuOpen.value = false;
});

// Calculer le nom complet de l'utilisateur
const userName = computed(() => {
  console.log('User object in userName:', props.user);
  if (!props.user) return '';
  const firstName = props.user.firstName || '';
  const lastName = props.user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  console.log('Full name:', fullName);
  return fullName || 'Utilisateur';
});

// Calculer le libellé du rôle utilisateur
const userRoleLabel = computed(() => {
  if (!props.user?.userType) return '';
  const roleMap = {
    'tenant': 'Locataire',
    'landlord': 'Propriétaire',
    'agent': 'Agent',
    'admin': 'Administrateur'
  };
  return roleMap[props.user.userType] || props.user.userType;
});

// Calculer les initiales de l'utilisateur
const userInitials = computed(() => {
  console.log('User object in userInitials:', props.user);
  
  if (!props.user) {
    console.log('No user object');
    return '';
  }
  
  // Vérifier si les propriétés existent directement sur l'objet user
  const firstName = props.user.firstName || '';
  const lastName = props.user.lastName || '';
  const email = props.user.email || '';
  
  // Si on a un prénom et/ou un nom, on les utilise
  if (firstName || lastName) {
    const name = `${firstName} ${lastName}`.trim();
    console.log('Name for initials:', name);
    
    if (name) {
      const initials = name
        .split(' ')
        .filter(part => part.length > 0)
        .map(n => n[0].toUpperCase())
        .join('')
        .substring(0, 2);
        
      console.log('Calculated initials from name:', initials);
      return initials;
    }
  }
  
  // Sinon, on essaie d'utiliser l'email
  if (email) {
    const emailInitials = email
      .split('@')[0] // Prendre la partie avant @
      .replace(/[^a-zA-Z]/g, '') // Supprimer les caractères non alphabétiques
      .split('')
      .filter((char, index, array) => index <= 1 || char === array[0]) // Prendre les 2 premiers caractères uniques
      .join('')
      .toUpperCase()
      .substring(0, 2);
      
    console.log('Calculated initials from email:', emailInitials);
    return emailInitials || 'U';
  }
  
  // Si tout échoue, on retourne une initiale par défaut
  console.log('No name or email available for initials');
  return '';
});

const toggleProfileMenu = () => {
  console.log('Toggle profile menu:', !isProfileMenuOpen.value);
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

const closeProfileMenu = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-menu') && isProfileMenuOpen.value) {
    console.log('Closing profile menu');
    isProfileMenuOpen.value = false;
  }
};

const handleLogout = async (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  console.log('Logout button clicked');
  isProfileMenuOpen.value = false;
  emit('logout');
};
</script>
