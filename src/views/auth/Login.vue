<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion
        </h2>
        <p v-if="error" class="mt-2 text-center text-sm text-red-600">
          {{ error }}
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              :value="form.email"
              @input="(e) => {
                console.log('Email input:', e.target.value);
                form.email = e.target.value;
                logInput('email', e);
              }"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="votre@email.com"
              autocomplete="username"
            />
            <p class="text-xs text-gray-500 mt-1">Valeur actuelle: "{{ form.email || 'vide' }}"</p>
          </div>
          
          <div>
            <label for="userType" class="block text-sm font-medium text-gray-700 mb-1">Type d'utilisateur</label>
            <select
              id="userType"
              :value="form.userType"
              @change="(e) => {
                console.log('UserType selected:', e.target.value);
                form.userType = e.target.value;
                logInput('userType', e);
              }"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            >
              <option value="" disabled>Sélectionnez un type d'utilisateur</option>
              <option value="tenant">Locataire</option>
              <option value="landlord">Propriétaire</option>
              <option value="agent">Agent immobilier</option>
              <option value="admin">Administrateur</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Valeur actuelle: "{{ form.userType || 'non sélectionné' }}"</p>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              :value="form.password"
              @input="(e) => {
                console.log('Password input:', e.target.value ? '***' : 'vide');
                form.password = e.target.value;
                logInput('password', e);
              }"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <p class="text-xs text-gray-500 mt-1">Mot de passe fourni: {{ form.password ? '***' : 'non fourni' }} (longueur: {{ form.password ? form.password.length : 0 }})</p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              v-model="form.rememberMe"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Se souvenir de moi
            </label>
          </div>

          <div class="text-sm">
            <router-link :to="{ name: 'forgot-password' }" class="font-medium text-blue-600 hover:text-blue-500">
              Mot de passe oublié ?
            </router-link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span v-if="!loading">Se connecter</span>
            <span v-else>Connexion en cours...</span>
          </button>
        </div>
      </form>

      <div class="text-center">
        <p class="text-sm text-gray-600">
          Pas encore de compte ?
          <router-link :to="{ name: 'register' }" class="font-medium text-blue-600 hover:text-blue-500">
            S'inscrire
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

type UserType = 'tenant' | 'landlord' | 'admin' | 'agent';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: '',
  userType: 'tenant' as UserType,
  rememberMe: false,
});

const error = ref('');
const loading = ref(false);

// Fonction pour logger les changements d'entrée
const logInput = (field: string, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  console.log(`Champ ${field} modifié:`, target.value);
  
  // Mettre à jour la valeur dans le formulaire
  if (field === 'email' || field === 'password') {
    form.value[field] = target.value;
  } else if (field === 'userType') {
    form.value.userType = target.value as 'tenant' | 'landlord' | 'admin' | 'agent';
  }
  
  console.log('État actuel du formulaire:', JSON.parse(JSON.stringify(form.value)));
};

const handleLogin = async () => {
  console.log('handleLogin appelé avec form:', JSON.parse(JSON.stringify(form.value)));
  
  // Vérification des champs avec plus de détails
  const missingFields = [];
  if (!form.value.email) missingFields.push('email');
  if (!form.value.password) missingFields.push('password');
  if (!form.value.userType) missingFields.push('userType');
  
  if (missingFields.length > 0) {
    console.warn('Champs manquants:', {
      missingFields,
      formValue: {
        email: form.value.email ? `"${form.value.email}" (${typeof form.value.email})` : 'undefined',
        password: form.value.password ? '***' : 'undefined',
        userType: form.value.userType ? `"${form.value.userType}" (${typeof form.value.userType})` : 'undefined'
      }
    });
    error.value = `Veuillez remplir les champs suivants : ${missingFields.join(', ')}`;
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    
    const loginData = {
      email: String(form.value.email).trim(),
      password: String(form.value.password),
      userType: String(form.value.userType)
    };
    
    console.log('Envoi des données de connexion:', { 
      ...loginData, 
      password: '***',
      types: {
        email: typeof loginData.email,
        password: typeof loginData.password,
        userType: typeof loginData.userType
      }
    });
    
    const loginResult = await authStore.login(loginData);
    console.log('Résultat de la connexion:', loginResult);
    
    // Redirection en fonction du type d'utilisateur
    const redirectPath = form.value.userType === 'admin' ? '/admin' : '/dashboard';
    router.push(redirectPath);
  } catch (err: any) {
    console.error('Erreur de connexion:', err);
    error.value = err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.';
  } finally {
    loading.value = false;
  }
};
</script>
