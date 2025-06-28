<template>
  <button 
    class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    @click="handleLogout"
  >
    Déconnexion
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const isLoading = ref(false);

const handleLogout = async () => {
  try {
    isLoading.value = true;
    await authStore.logout();
    // Redirection vers la page de connexion
    window.location.href = '/login';
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    // Afficher un message d'erreur à l'utilisateur
    alert('Une erreur est survenue lors de la déconnexion. Veuillez réessayer.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
button {
  transition: background-color 0.3s ease;
}
</style>
