<template>
  <div class="p-6">
    <div class="max-w-4xl mx-auto">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p class="mt-1 text-sm text-gray-500">Gérez vos informations personnelles et vos paramètres de compte.</p>
      </div>
      
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <!-- Section photo de profil -->
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div class="flex items-center">
            <div class="relative">
              <img class="h-20 w-20 rounded-full object-cover" :src="user.avatar" alt="Photo de profil">
              <button class="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 text-white hover:bg-blue-700 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div class="ml-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">{{ user.fullName }}</h3>
              <p class="mt-1 text-sm text-gray-500">Agent immobilier chez {{ user.agency }}</p>
              <div class="mt-2 flex space-x-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ user.status }}
                </span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ user.role }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Formulaire d'édition -->
        <div class="px-4 py-5 sm:p-6">
          <form @submit.prevent="saveProfile">
            <div class="space-y-6">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <!-- Prénom -->
                <div class="sm:col-span-3">
                  <label for="first_name" class="block text-sm font-medium text-gray-700">Prénom</label>
                  <div class="mt-1">
                    <input type="text" id="first_name" v-model="form.firstName" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                  </div>
                </div>
                
                <!-- Nom -->
                <div class="sm:col-span-3">
                  <label for="last_name" class="block text-sm font-medium text-gray-700">Nom</label>
                  <div class="mt-1">
                    <input type="text" id="last_name" v-model="form.lastName" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                  </div>
                </div>
                
                <!-- Email -->
                <div class="sm:col-span-4">
                  <label for="email" class="block text-sm font-medium text-gray-700">Adresse email</label>
                  <div class="mt-1">
                    <input id="email" type="email" v-model="form.email" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                  </div>
                </div>
                
                <!-- Téléphone -->
                <div class="sm:col-span-4">
                  <label for="phone" class="block text-sm font-medium text-gray-700">Téléphone</label>
                  <div class="mt-1">
                    <input type="tel" id="phone" v-model="form.phone" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                  </div>
                </div>
                
                <!-- Agence -->
                <div class="sm:col-span-4">
                  <label for="agency" class="block text-sm font-medium text-gray-700">Agence</label>
                  <div class="mt-1">
                    <input type="text" id="agency" v-model="form.agency" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                  </div>
                </div>
                
                <!-- Bio -->
                <div class="sm:col-span-6">
                  <label for="about" class="block text-sm font-medium text-gray-700">À propos</label>
                  <div class="mt-1">
                    <textarea id="about" rows="3" v-model="form.bio" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"></textarea>
                  </div>
                  <p class="mt-2 text-sm text-gray-500">Une brève description de vous-même pour vos clients.</p>
                </div>
                
                <!-- Réseaux sociaux -->
                <div class="sm:col-span-6">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">Réseaux sociaux</h3>
                  <p class="mt-1 text-sm text-gray-500">Ajoutez des liens vers vos profils sociaux.</p>
                </div>
                
                <div class="sm:col-span-6">
                  <div class="space-y-4">
                    <div v-for="(social, index) in form.socialLinks" :key="index" class="flex items-center">
                      <div class="w-32">
                        <select v-model="social.platform" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                          <option value="linkedin">LinkedIn</option>
                          <option value="facebook">Facebook</option>
                          <option value="twitter">Twitter</option>
                          <option value="instagram">Instagram</option>
                        </select>
                      </div>
                      <div class="ml-4 flex-1">
                        <input type="url" v-model="social.url" :placeholder="'Lien ' + social.platform" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                      </div>
                      <button type="button" @click="removeSocialLink(index)" class="ml-4 text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <button type="button" @click="addSocialLink" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="-ml-0.5 mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                      </svg>
                      Ajouter un réseau social
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Section mot de passe -->
              <div class="pt-6 border-t border-gray-200">
                <div>
                  <h3 class="text-lg font-medium leading-6 text-gray-900">Changer le mot de passe</h3>
                  <p class="mt-1 text-sm text-gray-500">Laissez vide pour ne pas modifier le mot de passe.</p>
                </div>
                
                <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div class="sm:col-span-3">
                    <label for="current_password" class="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                    <div class="mt-1 relative">
                      <input :type="showCurrentPassword ? 'text' : 'password'" id="current_password" v-model="password.current" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                      <button type="button" @click="showCurrentPassword = !showCurrentPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg v-if="!showCurrentPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div class="sm:col-span-3"></div>
                  
                  <div class="sm:col-span-3">
                    <label for="new_password" class="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                    <div class="mt-1 relative">
                      <input :type="showNewPassword ? 'text' : 'password'" id="new_password" v-model="password.new" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                      <button type="button" @click="showNewPassword = !showNewPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg v-if="!showNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div class="sm:col-span-3">
                    <label for="confirm_password" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                    <div class="mt-1 relative">
                      <input :type="showConfirmPassword ? 'text' : 'password'" id="confirm_password" v-model="password.confirm" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
                      <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Boutons d'action -->
              <div class="pt-5 border-t border-gray-200">
                <div class="flex justify-end space-x-3">
                  <button type="button" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Annuler
                  </button>
                  <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

// Données utilisateur
const user = {
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  fullName: 'Alexandre Martin',
  agency: 'ImmoPro Paris',
  status: 'En ligne',
  role: 'Agent immobilier senior'
};

// Formulaire
const form = reactive({
  firstName: 'Alexandre',
  lastName: 'Martin',
  email: 'a.martin@immopro.fr',
  phone: '06 12 34 56 78',
  agency: 'ImmoPro Paris - Champs-Élysées',
  bio: 'Agent immobilier passionné depuis plus de 10 ans, je vous accompagne dans tous vos projets immobiliers à Paris et sa région.',
  socialLinks: [
    { platform: 'linkedin', url: 'https://linkedin.com/in/alexandremartin' },
    { platform: 'twitter', url: 'https://twitter.com/alex_martin_immo' }
  ]
});

// Gestion des mots de passe
const password = reactive({
  current: '',
  new: '',
  confirm: ''
});

// État des champs de mot de passe
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Méthodes
const addSocialLink = () => {
  form.socialLinks.push({ platform: 'linkedin', url: '' });
};

const removeSocialLink = (index: number) => {
  form.socialLinks.splice(index, 1);
};

const saveProfile = () => {
  // Logique de sauvegarde du profil
  console.log('Profil sauvegardé :', { ...form });
  
  // Si un nouveau mot de passe est défini
  if (password.new) {
    if (password.new === password.confirm) {
      console.log('Mot de passe mis à jour');
      // Réinitialiser les champs de mot de passe
      password.current = '';
      password.new = '';
      password.confirm = '';
    } else {
      console.error('Les mots de passe ne correspondent pas');
    }
  }
  
  // Afficher un message de succès
  alert('Profil mis à jour avec succès !');
};
</script>
