<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-white">
    <!-- Partie image -->
    <div class="hidden md:flex md:w-1/2 items-center justify-center p-12">
      <div class="max-w-md">
        <img :src="logoImage" alt="Logo" class="object-contain" />
      </div>
    </div>
    
    <!-- Partie formulaire -->
    <div class="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-800">Mot de passe oublié</h2>
          <p class="mt-2 text-sm text-gray-600">Entrez votre adresse email pour réinitialiser votre mot de passe</p>
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Message de succès -->
        <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">{{ successMessage }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleForgotPassword" class="space-y-6">
          <!-- Champ email -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-700">Adresse email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <!-- Bouton de réinitialisation -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              :class="{ 'opacity-70 cursor-not-allowed': loading }"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Envoi en cours...' : 'Réinitialiser le mot de passe' }}
            </button>
          </div>

          <!-- Lien vers la page de connexion -->
          <div class="text-center text-sm text-gray-600">
            <p>Vous vous souvenez de votre mot de passe ?
              <router-link 
                :to="{ name: 'login' }" 
                class="font-medium text-blue-600 hover:text-blue-500 ml-1"
              >
                Se connecter
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoImage from '@/assets/logoGood.png'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  email: ''
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const handleForgotPassword = async () => {
  try {
    loading.value = true
    errorMessage.value = null
    successMessage.value = null
    
    await authStore.forgotPassword(form.value.email)
    successMessage.value = 'Un email de réinitialisation a été envoyé à votre adresse email.'
    
    // Réinitialiser le formulaire
    form.value.email = ''
  } catch (err: any) {
    errorMessage.value = err.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.'
  } finally {
    loading.value = false
  }
}
</script>
