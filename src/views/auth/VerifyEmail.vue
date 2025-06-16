<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Vérification de l'email
        </h2>
        <p v-if="errorMessage" class="mt-2 text-sm text-red-600">
          {{ errorMessage }}
        </p>
        <p v-if="successMessage" class="mt-2 text-sm text-green-600">
          {{ successMessage }}
        </p>
      </div>

      <div v-if="!loading && !successMessage" class="mt-8">
        <p class="text-center text-gray-600">
          Vérifiez votre email pour le lien de vérification.
        </p>
        <button
          @click="resendVerification"
          class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Renvoyer le lien de vérification
        </button>
      </div>

      <div class="mt-4 text-center">
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

const loading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Vérifier l'email au chargement
const token = route.params.token as string;
if (token) {
  verifyEmail();
}

const verifyEmail = async () => {
  try {
    loading.value = true;
    errorMessage.value = null;
    successMessage.value = null;
    
    await authStore.verifyEmail(token);
    successMessage.value = 'Votre email a été vérifié avec succès.';
    
    // Redirection vers la page de login après succès
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 2000);
  } catch (err: any) {
    errorMessage.value = err.message || 'Une erreur est survenue lors de la vérification.';
  } finally {
    loading.value = false;
  }
};

const resendVerification = async () => {
  try {
    loading.value = true;
    errorMessage.value = null;
    successMessage.value = null;
    
    await authStore.resendVerification();
    successMessage.value = 'Un nouveau lien de vérification a été envoyé à votre email.';
  } catch (err: any) {
    errorMessage.value = err.message || 'Une erreur est survenue lors de l\'envoi du lien.';
  } finally {
    loading.value = false;
  }
};
</script>
