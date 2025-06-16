<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Mon Profil</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <!-- Profile Header -->
      <div class="flex flex-col md:flex-row items-center mb-8">
        <div class="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 md:mb-0 md:mr-8">
          <span class="text-4xl text-gray-500">
            {{ userInitials }}
          </span>
        </div>
        <div class="text-center md:text-left">
          <h2 class="text-xl font-semibold">{{ user.name }}</h2>
          <p class="text-gray-600">{{ user.email }}</p>
          <p class="text-gray-600">{{ user.phone || 'Aucun numéro de téléphone' }}</p>
          <button class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
            Changer la photo de profil
          </button>
        </div>
      </div>

      <!-- Personal Information Form -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 border-b pb-2">Informations personnelles</h3>
        <form @submit.prevent="saveProfile" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input 
              v-model="user.name"
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              v-model="user.email"
              type="email" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input 
              v-model="user.phone"
              type="tel" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
            <input 
              v-model="user.birthDate"
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input 
              v-model="user.address"
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="md:col-span-2 flex justify-end mt-4">
            <button 
              type="submit" 
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="isSaving"
            >
              <span v-if="!isSaving">Enregistrer les modifications</span>
              <span v-else>Enregistrement...</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password Section -->
      <div>
        <h3 class="text-lg font-semibold mb-4 border-b pb-2">Changer le mot de passe</h3>
        <form @submit.prevent="changePassword" class="max-w-md">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <input 
              v-model="password.current"
              type="password" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input 
              v-model="password.new"
              type="password" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
            <input 
              v-model="password.confirm"
              type="password" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
          </div>
          <button 
            type="submit" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :disabled="isChangingPassword"
          >
            <span v-if="!isChangingPassword">Mettre à jour le mot de passe</span>
            <span v-else>Mise à jour...</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Account Actions -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold mb-4 text-red-600">Zone de danger</h3>
      <div class="flex flex-col space-y-4">
        <button 
          @click="showDeleteAccount = true"
          class="px-4 py-2 text-left text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Supprimer mon compte
        </button>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div v-if="showDeleteAccount" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">Confirmer la suppression</h3>
        <p class="mb-6">Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
        <div class="flex justify-end space-x-4">
          <button 
            @click="showDeleteAccount = false"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Annuler
          </button>
          <button 
            @click="deleteAccount"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            :disabled="isDeleting"
          >
            <span v-if="!isDeleting">Supprimer mon compte</span>
            <span v-else>Suppression en cours...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

// User data
const user = ref({
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  phone: '+33 6 12 34 56 78',
  birthDate: '1985-04-15',
  address: '123 Rue de la Paix, 75001 Paris, France'
});

// Password change form
const password = ref({
  current: '',
  new: '',
  confirm: ''
});

// UI states
const isSaving = ref(false);
const isChangingPassword = ref(false);
const isDeleting = ref(false);
const showDeleteAccount = ref(false);

// Computed
const userInitials = computed(() => {
  return user.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

// Methods
const saveProfile = async () => {
  try {
    isSaving.value = true;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Profil mis à jour avec succès');
  } catch (error) {
    toast.error('Une erreur est survenue lors de la mise à jour du profil');
  } finally {
    isSaving.value = false;
  }
};

const changePassword = async () => {
  if (password.value.new !== password.value.confirm) {
    toast.error('Les mots de passe ne correspondent pas');
    return;
  }

  try {
    isChangingPassword.value = true;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form
    password.value = { current: '', new: '', confirm: '' };
    toast.success('Mot de passe mis à jour avec succès');
  } catch (error) {
    toast.error('Une erreur est survenue lors du changement de mot de passe');
  } finally {
    isChangingPassword.value = false;
  }
};

const deleteAccount = async () => {
  try {
    isDeleting.value = true;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Votre compte a été supprimé avec succès');
    // Redirect to login or home page
    // router.push('/login');
  } catch (error) {
    toast.error('Une erreur est survenue lors de la suppression du compte');
  } finally {
    isDeleting.value = false;
    showDeleteAccount.value = false;
  }
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
