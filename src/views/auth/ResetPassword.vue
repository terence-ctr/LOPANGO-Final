<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Réinitialiser votre mot de passe
        </h2>
        <p v-if="errorMessage" class="mt-2 text-center text-sm text-red-600">
          {{ errorMessage }}
        </p>
        <p v-if="successMessage" class="mt-2 text-center text-sm text-green-600">
          {{ successMessage }}
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="password" class="sr-only">Nouveau mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              v-model="form.password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Nouveau mot de passe"
            />
          </div>
          <div>
            <label for="password_confirmation" class="sr-only">Confirmer le mot de passe</label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              required
              v-model="form.passwordConfirmation"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Confirmer le mot de passe"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span v-if="!loading">Réinitialiser</span>
            <span v-else>Réinitialisation en cours...</span>
          </button>
        </div>
      </form>

      <div class="text-center">
        <p class="text-sm text-gray-600">
          Retour à la 
          <router-link :to="{ name: 'login' }" class="font-medium text-blue-600 hover:text-blue-500">
            connexion
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = ref({
  password: '',
  passwordConfirmation: ''
});

const loading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const handleResetPassword = async () => {
  try {
    loading.value = true;
    errorMessage.value = null;
    successMessage.value = null;
    
    if (form.value.password !== form.value.passwordConfirmation) {
      throw new Error('Les mots de passe ne correspondent pas');
    }

    const token = route.params.token as string;
    await authStore.resetPassword(token, form.value.password);
    successMessage.value = 'Votre mot de passe a été réinitialisé avec succès.';
    
    // Redirection vers la page de connexion après succès
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 2000);
  } catch (err: any) {
    errorMessage.value = err.message || 'Une erreur est survenue lors de la réinitialisation.';
  } finally {
    loading.value = false;
  }
};
</script>
