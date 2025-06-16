<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Mon profil</h1>
    
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- En-tête du profil -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center">
          <div class="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="ml-6">
            <h2 class="text-xl font-semibold">Nom du propriétaire</h2>
            <p class="text-gray-600">proprietaire@example.com</p>
            <p class="text-sm text-gray-500 mt-1">Membre depuis janvier 2023</p>
          </div>
        </div>
      </div>
      
      <!-- Formulaire de profil -->
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4">Informations personnelles</h3>
        
        <form @submit.prevent="saveProfile" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input 
                type="text" 
                v-model="profile.firstName"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input 
                type="text" 
                v-model="profile.lastName"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              v-model="profile.email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input 
              type="tel" 
              v-model="profile.phone"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="+33 6 12 34 56 78"
            >
          </div>
          
          <div class="pt-4 border-t border-gray-200">
            <h3 class="text-lg font-medium mb-4">Changer de mot de passe</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                <input 
                  type="password" 
                  v-model="password.current"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  v-model="password.new"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input 
                  type="password" 
                  v-model="password.confirm"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
            </div>
          </div>
          
          <div class="flex justify-end pt-4 border-t border-gray-200">
            <button 
              type="button" 
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Données du profil
const profile = ref({
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@example.com',
  phone: '+33 6 12 34 56 78'
});

// Données pour le changement de mot de passe
const password = ref({
  current: '',
  new: '',
  confirm: ''
});

// Fonction pour sauvegarder le profil
const saveProfile = () => {
  // Implémentez la logique de sauvegarde ici
  console.log('Profil sauvegardé :', profile.value);
  
  // Si un nouveau mot de passe est fourni
  if (password.value.new) {
    if (password.value.new === password.value.confirm) {
      console.log('Nouveau mot de passe défini');
    } else {
      console.error('Les mots de passe ne correspondent pas');
    }
  }
};
</script>
