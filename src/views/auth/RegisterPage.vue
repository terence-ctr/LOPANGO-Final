<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import authService, { type UserType } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/types/user.types';
import type { RegisterData } from '@/types/auth.types';

const router = useRouter();
const authStore = useAuthStore();

const formData = reactive<RegisterData>({
  // Informations de base
  email: '',
  password: '',
  passwordConfirmation: '',
  firstName: '',
  lastName: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  
  // Adresse
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: 'Congo' as const // Valeur par défaut
  },
  
  // Type d'utilisateur
  userType: 'tenant',
  
  // Identité
  identity: {
    documentType: 'passport',
    nationalId: '',
    documentFront: undefined,
    documentBack: undefined
  },
  
  // Acceptation des CGU
  acceptedTerms: false,
  acceptedPrivacyPolicy: false
});

const error = ref('');
const successMessage = ref('');
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const formSubmitted = ref(false);
const passwordStrength = ref('');
const logoImage = '/src/assets/logoGood.png'; // Assurez-vous que cette image existe dans le dossier public
const idCardImageUrl = ref('');

const checkPasswordStrength = () => {
  const password = formData.password;
  if (!password) {
    passwordStrength.value = '';
    return;
  }

  // Vérification de la force du mot de passe
  let strength = 0;
  
  // Longueur minimale
  if (password.length >= 8) strength += 1;
  
  // Contient des lettres minuscules
  if (/[a-z]/.test(password)) strength += 1;
  
  // Contient des lettres majuscules
  if (/[A-Z]/.test(password)) strength += 1;
  
  // Contient des chiffres
  if (/[0-9]/.test(password)) strength += 1;
  
  // Contient des caractères spéciaux
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  // Détermination du niveau de force
  if (strength <= 2) {
    passwordStrength.value = 'weak';
  } else if (strength <= 4) {
    passwordStrength.value = 'medium';
  } else {
    passwordStrength.value = 'strong';
  }
};

const handleFileUpload = (event: Event, field: 'documentFront' | 'documentBack') => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    formData.identity[field] = input.files[0];
  }
};

const validateForm = (): boolean => {
  formSubmitted.value = true;
  
  // Vérification des champs requis
  if (!formData.email || !formData.password || !formData.confirmPassword || 
      !formData.firstName || !formData.lastName || !formData.phone || 
      !formData.dateOfBirth || !formData.address.street || 
      !formData.address.city || !formData.address.country ||
      !formData.identity.nationalId || !formData.identity.documentFront ||
      !formData.identity.documentBack || !formData.acceptedTerms ||
      !formData.acceptedPrivacyPolicy) {
    error.value = 'Veuillez remplir tous les champs obligatoires';
    return false;
  }
  
  if (formData.password !== formData.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas';
    return false;
  }
  
  if (formData.password.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères';
    return false;
  }
  
  return true;
};

const register = async () => {
  try {
    error.value = '';
    successMessage.value = '';
    
    if (!validateForm()) return;
    
    loading.value = true;
    
    // Préparer les données pour l'inscription
    const userData = {
      email: formData.email,
      password: formData.password,
      passwordConfirmation: formData.confirmPassword,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      address: {
        street: formData.address.street,
        city: formData.address.city,
        postalCode: formData.address.postalCode,
        country: formData.address.country
      },
      userType: formData.userType,
      identity: {
        documentType: formData.identity.documentType,
        nationalId: formData.identity.nationalId,
        documentFront: formData.identity.documentFront,
        documentBack: formData.identity.documentBack
      },
      acceptedTerms: formData.acceptedTerms,
      acceptedPrivacyPolicy: formData.acceptedPrivacyPolicy
    };
    
    await authService.register(userData);
    
    // Réinitialiser le formulaire après inscription réussie
    successMessage.value = 'Inscription réussie ! Redirection en cours...';
    
    // Rediriger vers la page de connexion après un court délai
    setTimeout(() => {
      router.push('/login');
    }, 2000);
    
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue lors de l\'inscription';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-white">
    <!-- Partie image -->
    <div class="hidden md:flex md:w-1/2 items-start pt-12">
      <div class="w-full px-12">
        <div class="relative w-full h-0 pb-[80%]">
          <img 
            :src="logoImage" 
            alt="Logo"
            class="absolute inset-0 object-contain object-center"
          />
        </div>
      </div>
    </div>
    
    <!-- Partie formulaire -->
    <div class="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-800">Créer un compte</h2>
          <p class="mt-2 text-sm text-gray-600">Rejoignez notre plateforme en quelques étapes simples</p>
        </div>

        <!-- Messages de notification -->
        <div v-if="error || successMessage" class="space-y-4 mb-6">
          <!-- Message d'erreur -->
          <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Erreur</h3>
                <div class="mt-1 text-sm text-red-700">
                  <p>{{ error }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Message de succès -->
          <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">Succès</h3>
                <div class="mt-1 text-sm text-green-700">
                  <p>{{ successMessage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="register" class="space-y-6">
          <!-- Section 1: Informations personnelles -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b pb-2">Informations personnelles</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Prénom -->
              <div class="space-y-1">
                <label for="firstName" class="block text-sm font-medium text-gray-700">
                  Prénom <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="firstName"
                    v-model="formData.firstName"
                    type="text"
                    required
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <!-- Nom -->
              <div class="space-y-1">
                <label for="lastName" class="block text-sm font-medium text-gray-700">
                  Nom <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="lastName"
                    v-model="formData.lastName"
                    type="text"
                    required
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-1">
              <label for="email" class="block text-sm font-medium text-gray-700">
                Adresse email <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  autocomplete="email"
                  required
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <!-- Téléphone -->
            <div class="space-y-1">
              <label for="phone" class="block text-sm font-medium text-gray-700">
                Téléphone <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <input
                  id="phone"
                  v-model="formData.phone"
                  type="tel"
                  required
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Votre numéro de téléphone"
                />
              </div>
            </div>

            <!-- Date de naissance -->
            <div class="space-y-1">
              <label for="dateOfBirth" class="block text-sm font-medium text-gray-700">
                Date de naissance <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  id="dateOfBirth"
                  v-model="formData.dateOfBirth"
                  type="date"
                  required
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- Genre -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">
                Genre <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2">
                <div class="flex items-center">
                  <input
                    id="gender-male"
                    v-model="formData.gender"
                    type="radio"
                    value="male"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label for="gender-male" class="ml-2 block text-sm text-gray-700">
                    Homme
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    id="gender-female"
                    v-model="formData.gender"
                    type="radio"
                    value="female"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label for="gender-female" class="ml-2 block text-sm text-gray-700">
                    Femme
                  </label>
                </div>
               
              </div>
            </div>
          </div>

          <!-- Section 2: Adresse -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b pb-2">Adresse</h3>
            
            <!-- Rue -->
            <div class="space-y-1">
              <label for="street" class="block text-sm font-medium text-gray-700">
                Adresse <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  id="adresse"
                  v-model="formData.address.street"
                  type="text"
                  required
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Votre adresse complète"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Ville -->
              <div class="space-y-1">
                <label for="city" class="block text-sm font-medium text-gray-700">
                  Ville <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="ville"
                    v-model="formData.address.city"
                    type="text"
                    required
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Votre ville"
                  />
                </div>
              </div>
              
              <!-- Code postal -->
              <div class="space-y-1">
                <label for="postalCode" class="block text-sm font-medium text-gray-700">
                  Code postal
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="code-postal"
                    v-model="formData.address.postalCode"
                    type="text"
                    maxlength="5"
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Code postal"
                  />
                </div>
              </div>
              
              <!-- Pays -->
              <div class="space-y-1">
                <label for="country" class="block text-sm font-medium text-gray-700">
                  Pays <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="pays"
                    v-model="formData.address.country"
                    type="text"
                    required
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Votre pays"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Informations de connexion -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b pb-2">Informations de connexion</h3>
             <!-- Sélecteur de type d'utilisateur -->
          <div class="space-y-2">
            <label for="userType" class="block text-sm font-medium text-gray-700">Type de compte</label>
            <div class="relative">
              <select
                id="userType"
                v-model="formData.userType"
                name="userType"
                required
                class="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none"
              >
                <option value="" disabled selected>Sélectionnez un type de compte</option>
                <option value="tenant">Locataire</option>
                <option value="landlord">Propriétaire</option>
                <option value="agent">Agent immobilier</option>
                <option value="admin">Administrateur</option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
            <!-- Mot de passe -->
            <div class="space-y-1">
              <label for="password" class="block text-sm font-medium text-gray-700">
                Mot de passe <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  minlength="8"
                  class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  @input="checkPasswordStrength"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'"
                >
                  <svg v-if="showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473C18.1 12.368 20 10.25 20 10c0-4.42-4.03-8-9-8a9.7 9.7 0 00-3.6.705l-1.693-1.412zM10 5a5 5 0 00-4.86 6.15l-1.52-1.52A7.02 7.02 0 013 10c0-1.85.63-3.55 1.68-4.9l1.8 1.8A5 5 0 0010 5z" clip-rule="evenodd" />
                    <path d="M5.52 12.9l1.6 1.6a5 5 0 006.4-6.4l1.6 1.6a7 7 0 01-9.6 3.2z" />
                  </svg>
                </button>
              </div>
              
              <!-- Indicateur de force du mot de passe -->
              <div v-if="formData.password" class="mt-2">
                <div class="flex items-center space-x-2 text-xs">
                  <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full transition-all duration-300" 
                      :class="{
                        'w-1/4 bg-red-500': passwordStrength === 'weak',
                        'w-1/2 bg-yellow-500': passwordStrength === 'medium',
                        'w-full bg-green-500': passwordStrength === 'strong',
                        'w-0': !formData.password
                      }"
                    ></div>
                  </div>
                  <span class="text-gray-500">
                    <span v-if="passwordStrength === 'weak'">Faible</span>
                    <span v-else-if="passwordStrength === 'medium'">Moyen</span>
                    <span v-else-if="passwordStrength === 'strong'">Fort</span>
                  </span>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  Le mot de passe doit contenir au moins 8 caractères, dont des majuscules, des minuscules et des chiffres.
                </p>
              </div>
            </div>

            <!-- Confirmer le mot de passe -->
            <div class="space-y-1">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  minlength="8"
                  class="block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm"
                  :class="{
                    'border-gray-300 focus:ring-blue-500 focus:border-blue-500': !formData.confirmPassword || formData.password === formData.confirmPassword,
                    'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500': formData.confirmPassword && formData.password !== formData.confirmPassword
                  }"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :aria-label="showConfirmPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'"
                >
                  <svg v-if="showConfirmPassword" class="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473C18.1 12.368 20 10.25 20 10c0-4.42-4.03-8-9-8a9.7 9.7 0 00-3.6.705l-1.693-1.412zM10 5a5 5 0 00-4.86 6.15l-1.52-1.52A7.02 7.02 0 013 10c0-1.85.63-3.55 1.68-4.9l1.8 1.8A5 5 0 0010 5z" clip-rule="evenodd" />
                    <path d="M5.52 12.9l1.6 1.6a5 5 0 006.4-6.4l1.6 1.6a7 7 0 01-9.6 3.2z" />
                  </svg>
                </button>
              </div>
              <p v-if="formData.confirmPassword && formData.password !== formData.confirmPassword" class="mt-1 text-sm text-red-600">
                Les mots de passe ne correspondent pas
              </p>
            </div>
          </div>

          <!-- Section 3: Vérification d'identité -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b pb-2">Vérification d'identité</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Numéro de pièce d'identité -->
              <div class="space-y-1">
                <label for="nationalId" class="block text-sm font-medium text-gray-700">
                  Numéro de pièce d'identité <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="nationalId"
                    v-model="formData.identity.nationalId"
                    type="text"
                    required
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="N° de pièce d'identité"
                  />
                </div>
              </div>

              <!-- Photo de la pièce d'identité -->
            <!-- Document Front -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Photo recto du document <span class="text-red-500">*</span>
                </label>
                <div class="mt-1 flex items-center">
                  <label class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span>Téléverser</span>
                    <input 
                      type="file" 
                      class="sr-only" 
                      accept="image/*,.pdf"
                      @change="(e) => handleFileUpload(e, 'documentFront')"
                    />
                  </label>
                  <span class="ml-3 text-sm text-gray-500 truncate">
                    {{ formData.identity.documentFront?.name || 'Aucun fichier sélectionné' }}
                  </span>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  Format accepté : JPG, PNG ou PDF (max 5MB)
                </p>
              </div>
              
              <!-- Document Back -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Photo verso du document <span class="text-red-500">*</span>
                </label>
                <div class="mt-1 flex items-center">
                  <label class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span>Téléverser</span>
                    <input 
                      type="file" 
                      class="sr-only" 
                      accept="image/*,.pdf"
                      @change="(e) => handleFileUpload(e, 'documentBack')"
                    />
                  </label>
                  <span class="ml-3 text-sm text-gray-500 truncate">
                    {{ formData.identity.documentBack?.name || 'Aucun fichier sélectionné' }}
                  </span>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  Format accepté : JPG, PNG ou PDF (max 5MB)
                </p>
              </div>
             
            </div>
          </div>

          <!-- Acceptation des CGU -->
          <div class="space-y-4 pt-2">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="acceptedTerms"
                  v-model="formData.acceptedTerms"
                  type="checkbox"
                  required
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="acceptedTerms" class="font-medium text-gray-700">
                  J'accepte les <a href="/conditions-generales" class="text-blue-600 hover:text-blue-500" target="_blank">conditions générales d'utilisation</a>
                  <span class="text-red-500">*</span>
                </label>
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="acceptedPrivacyPolicy"
                  v-model="formData.acceptedPrivacyPolicy"
                  type="checkbox"
                  required
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="acceptedPrivacyPolicy" class="font-medium text-gray-700">
                  J'accepte la <a href="/politique-de-confidentialite" class="text-blue-600 hover:text-blue-500" target="_blank">politique de confidentialité</a>
                  <span class="text-red-500">*</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Bouton de soumission -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              :class="{'opacity-70 cursor-not-allowed': loading}"
            >
              <span v-if="!loading" class="flex items-center">
                <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Créer mon compte
              </span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création du compte...
              </span>
            </button>
          </div>

          <!-- Lien vers la connexion -->
          <div class="text-center text-sm pt-2">
            <p class="text-gray-600">
              Vous avez déjà un compte ?
              <a href="#" @click.prevent="goToLogin" class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                Connectez-vous ici
              </a>
            </p>
          </div>
          
          <!-- Mentions légales -->
          <p class="text-xs text-center text-gray-500 mt-4">
            En cliquant sur "Créer mon compte", vous acceptez nos
            <a href="#" class="text-blue-600 hover:text-blue-500 transition-colors duration-200">conditions d'utilisation</a>
            et notre
            <a href="#" class="text-blue-600 hover:text-blue-500 transition-colors duration-200">politique de confidentialité</a>.
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
