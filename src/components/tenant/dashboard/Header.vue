<template>
  <header class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-2xl font-bold">Bonjour, {{ user.name }} 👋</h1>
      <p class="text-gray-500 text-sm">Voici un résumé de votre activité</p>
    </div>
    <div class="flex items-center space-x-4">
      <button 
        class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        @click="toggleNotifications"
      >
        <font-awesome-icon :icon="['fas', 'bell']" class="text-xl" />
        <span 
          v-if="hasNotifications"
          class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
        ></span>
      </button>
      <div class="relative">
        <img 
          :src="user.avatar" 
          alt="User avatar"
          class="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({
      name: 'Utilisateur',
      avatar: 'https://via.placeholder.com/40'
    })
  },
  hasNotifications: {
    type: Boolean,
    default: false
  }
});


const toggleNotifications = () => {
  // Implémenter la logique de notification
  console.log('Toggle notifications');};
</script>
