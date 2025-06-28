<script setup lang="ts">
import { computed, defineProps } from 'vue';
import LogoutButton from '../auth/LogoutButton.vue';

const props = defineProps({
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
          class="text-gray-500 hover:text-gray-700 focus:outline-none"
          @click="$emit('toggleSidebar')"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div class="flex items-center">
        <div class="flex-shrink-0">
          <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white">
            {{ getUserInitials() }}
          </span>
        </div>
        <div class="ml-3">
          <div class="text-sm font-medium text-gray-900">
            {{ props.user.first_name }} {{ props.user.last_name }}
          </div>
          <div class="text-sm text-gray-500">
            {{ props.user.email }}
          </div>
        </div>
        <div class="ml-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
button {
  transition: background-color 0.3s ease;
}
</style>