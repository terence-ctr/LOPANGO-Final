<script setup lang="ts">
import { computed } from 'vue';

defineProps({
  pageTitle: {
    type: String,
    required: true
  },
  user: {
    type: Object,
    required: true,
    default: () => ({
      first_name: '',
      last_name: '',
      email: ''
    })
  }
})

defineEmits(['toggleSidebar'])

// Fonction pour obtenir les initiales de l'utilisateur
const getUserInitials = () => {
  const user = props.user;
  if (!user) return 'U';
  
  // Essayer d'abord avec first_name et last_name
  if (user.first_name || user.last_name) {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U';
  }
  
  // Sinon essayer avec le nom complet
  if (user.name) {
    return user.name.charAt(0).toUpperCase();
  }
  
  // Sinon utiliser l'email
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  
  return 'U';
}
</script>

<template>
  <header class="bg-white shadow-sm z-10 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center">
        <button 
          class="text-gray-500 focus:outline-none mr-4"
          @click="$emit('toggleSidebar')"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-xl font-bold text-gray-900">{{ pageTitle }}</h1>
      </div>
      
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <button class="text-gray-400 hover:text-gray-500 focus:outline-none relative">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <!-- User profile -->
        <div class="relative ml-3">
          <div class="flex items-center">
            <div class="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-600 font-semibold">
              {{ user?.name.charAt(0).toUpperCase() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>