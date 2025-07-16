<template>
  <div class="min-h-screen bg-gray-50">
    <!-- En-tête -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <button 
            @click="goBack"
            class="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 ease-in-out group"
          >
            <i class="fas fa-arrow-left mr-2 transform group-hover:-translate-x-1 transition-transform"></i>
            <span class="font-medium">Retour aux contrats</span>
          </button>
          
          <div class="flex space-x-3">
            <button
              @click="downloadContract"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <i class="fas fa-file-pdf text-red-500 mr-2"></i>
              Télécharger le contrat
            </button>
          </div>
        </div>
        
        <div class="mt-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Contrat de location</h1>
            <p class="mt-1 text-sm text-gray-500">
              Référence #{{ currentContract?.id || '...' }}
            </p>
          </div>
          
          <div class="mt-4 md:mt-0">
            <span 
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                getStatusClass(currentContract?.status)
              ]"
            >
              {{ getStatusLabel(currentContract?.status) }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- État de chargement -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-pulse flex flex-col items-center">
          <div class="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-600">Chargement du contrat...</p>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-circle text-red-500 text-xl"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Contenu du contrat -->
      <div v-else-if="currentContract && currentContract.property" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Carte Période de location -->
          <div class="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-md">
            <div class="px-6 py-5 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900 flex items-center">
                <i class="far fa-calendar-alt text-indigo-500 mr-2"></i>
                Période de location
              </h2>
            </div>
            <div class="px-6 py-5">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center p-4 bg-indigo-50 rounded-lg">
                  <p class="text-sm font-medium text-indigo-600">Date de début</p>
                  <p class="mt-1 text-lg font-semibold text-gray-900">
                    {{ formatDate(currentContract.startDate || currentContract.start_date) }}
                  </p>
                </div>
                <div class="text-center p-4 bg-indigo-50 rounded-lg">
                  <p class="text-sm font-medium text-indigo-600">Date de fin</p>
                  <p class="mt-1 text-lg font-semibold text-gray-900">
                    {{ currentContract.endDate ? formatDate(currentContract.endDate) : 'Indéterminée' }}
                  </p>
                </div>
                <div class="text-center p-4 bg-indigo-50 rounded-lg">
                  <p class="text-sm font-medium text-indigo-600">Durée</p>
                  <p class="mt-1 text-lg font-semibold text-gray-900">
                    {{ currentContract.duration || 'Non spécifiée' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Détails financiers -->
          <div class="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-md">
            <div class="px-6 py-5 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900 flex items-center">
                <i class="fas fa-wallet text-green-500 mr-2"></i>
                Détails financiers
              </h2>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Loyer mensuel -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-500">Loyer mensuel</p>
                      <p class="mt-1 text-2xl font-bold text-gray-900">
                        {{ formatCurrency(currentContract.rent) }}
                      </p>
                    </div>
                    <div class="p-2 bg-green-100 rounded-full">
                      <i class="fas fa-home text-green-500"></i>
                    </div>
                  </div>
                  <p class="mt-2 text-xs text-gray-500">TTC / mois</p>
                </div>

                <!-- Dépôt de garantie -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-500">Dépôt de garantie</p>
                      <p class="mt-1 text-2xl font-bold text-gray-900">
                        {{ currentContract.deposit ? formatCurrency(currentContract.deposit) : 'Non spécifié' }}
                      </p>
                    </div>
                    <div class="p-2 bg-amber-100 rounded-full">
                      <i class="fas fa-shield-alt text-amber-500"></i>
                    </div>
                  </div>
                </div>

                <!-- Jour de paiement -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-500">Jour de paiement</p>
                      <p class="mt-1 text-2xl font-bold text-gray-900">
                        {{ currentContract.paymentDay ? currentContract.paymentDay : '--' }}
                      </p>
                    </div>
                    <div class="p-2 bg-blue-100 rounded-full">
                      <i class="far fa-calendar-alt text-blue-500"></i>
                    </div>
                  </div>
                  <p class="mt-2 text-xs text-gray-500">de chaque mois</p>
                </div>
              </div>
              
              <!-- Conditions particulières -->
              <div v-if="currentContract.specialConditions" class="mt-6 pt-6 border-t border-gray-100">
                <h3 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <i class="fas fa-file-contract text-indigo-500 mr-2"></i>
                  Conditions particulières
                </h3>
                <div class="bg-indigo-50 p-4 rounded-lg">
                  <p class="text-gray-700 whitespace-pre-line">{{ currentContract.specialConditions }}</p>
                </div>
              </div>
              
              <!-- Paiements -->
              <div class="mt-6 pt-6 border-t border-gray-100">
                <h3 class="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <i class="fas fa-credit-card text-green-500 mr-2"></i>
                  Historique des paiements
                </h3>
                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div class="p-4 text-center text-gray-500 text-sm">
                    <i class="fas fa-inbox text-2xl text-gray-300 mb-2"></i>
                    <p>Aucun paiement enregistré pour le moment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Détails du bien -->
          <div class="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-md">
            <div class="px-6 py-5 border-b border-gray-200">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-medium text-gray-900 flex items-center">
                  <i class="fas fa-home text-indigo-500 mr-2"></i>
                  Détails du bien
                </h2>
                <span 
                  v-if="getPropertyType(currentContract.property)" 
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {{ getPropertyType(currentContract.property) }}
                </span>
              </div>
            </div>
            
            <div class="p-6">
              <!-- En-tête avec titre et usage -->
              <div class="mb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-1">
                  {{ getPropertyTitle(currentContract.property) }}
                </h3>
                <p v-if="getPropertyUsage(currentContract.property)" class="text-sm text-indigo-600 font-medium">
                  {{ getPropertyUsage(currentContract.property) }}
                </p>
              </div>
              
              <!-- Adresse -->
              <div class="mb-8">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Adresse</h4>
                <div v-if="hasAddress(currentContract)" class="flex items-start group">
                  <div class="flex-shrink-0 p-2 bg-indigo-50 rounded-full mr-3 mt-0.5">
                    <i class="fas fa-map-marker-alt text-indigo-500"></i>
                  </div>
                  <div>
                    <p class="text-gray-800 font-medium">{{ currentContract?.property_address || 'Aucune adresse' }}</p>
                    <p v-if="getPropertyFloor(currentContract?.property) !== 'Non spécifié'" class="text-sm text-gray-500 mt-1">
                      <i class="fas fa-layer-group mr-1"></i> Étage {{ getPropertyFloor(currentContract?.property) }}
                    </p>
                  </div>
                </div>
                <div v-else class="text-gray-400 italic">
                  <i class="fas fa-map-marker-alt text-gray-300 mr-2"></i>
                  Aucune adresse disponible
                </div>
              </div>
              
              <!-- Caractéristiques -->
              <div class="mb-8">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Caractéristiques</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="text-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
                    <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-100 flex items-center justify-center">
                      <i class="fas fa-vector-square text-indigo-500"></i>
                    </div>
                    <p class="text-xs text-gray-500">Surface</p>
                    <p class="text-sm font-semibold text-gray-800">{{ getPropertyArea(currentContract.property) }}</p>
                  </div>
                  
                  <div class="text-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
                    <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-100 flex items-center justify-center">
                      <i class="fas fa-door-open text-indigo-500"></i>
                    </div>
                    <p class="text-xs text-gray-500">Pièces</p>
                    <p class="text-sm font-semibold text-gray-800">{{ getPropertyRooms(currentContract.property) }}</p>
                  </div>
                  
                  <div class="text-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
                    <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-100 flex items-center justify-center">
                      <i class="fas fa-bath text-indigo-500"></i>
                    </div>
                    <p class="text-xs text-gray-500">Salles de bain</p>
                    <p class="text-sm font-semibold text-gray-800">{{ getPropertyBathrooms(currentContract.property) }}</p>
                  </div>
                  
                  <div 
                    v-if="getPropertyFloor(currentContract.property) !== 'Non spécifié'" 
                    class="text-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-100 flex items-center justify-center">
                      <i class="fas fa-layer-group text-indigo-500"></i>
                    </div>
                    <p class="text-xs text-gray-500">Étage</p>
                    <p class="text-sm font-semibold text-gray-800">{{ getPropertyFloor(currentContract.property) }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Description et équipements -->
              <div class="space-y-6">
                <div v-if="currentContract.property.description">
                  <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                  <div class="prose prose-sm max-w-none text-gray-600">
                    {{ currentContract.property.description }}
                  </div>
                </div>
                
                <div v-if="currentContract.property.equipment && currentContract.property.equipment.length > 0">
                  <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Équipements</h4>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="(equipment, index) in currentContract.property.equipment" 
                      :key="index"
                      class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
                    >
                      <i class="fas fa-check-circle text-indigo-500 mr-1.5 text-xs"></i>
                      {{ equipment }}
                    </span>
                  </div>
                </div>
                
                <div v-if="currentContract.property.availableFrom" class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <i class="fas fa-calendar-check text-blue-500 mt-0.5"></i>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-blue-800">Disponible à partir du</p>
                      <p class="text-sm text-blue-700 font-semibold mt-0.5">
                        {{ formatDate(currentContract.property.availableFrom) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne de droite - Parties prenantes -->
        
        </div>

        <!-- Colonne de droite - Parties prenantes -->
        <div class="space-y-6">
          <!-- Carte Propriétaire -->
          <div class="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-md">
            <div class="px-6 py-5 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900 flex items-center">
                <i class="fas fa-user-tie text-indigo-500 mr-2"></i>
                Propriétaire
              </h2>
            </div>
            <div class="p-6">
              <div v-if="currentContract.landlord" class="space-y-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <i class="fas fa-user text-indigo-500 text-xl"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-base font-medium text-gray-900">
                      {{ currentContract.landlord.firstName }} {{ currentContract.landlord.lastName }}
                    </p>
                    <p class="text-sm text-indigo-600">Bailleur</p>
                  </div>
                </div>
                
                <div class="space-y-2 mt-4">
                  <div class="flex items-start">
                    <div class="flex-shrink-0 mt-0.5">
                      <i class="fas fa-envelope text-gray-400"></i>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-gray-500">Email</p>
                      <p class="text-sm font-medium text-gray-900 break-all">
                        {{ currentContract.landlord.email || 'Non disponible' }}
                      </p>
                    </div>
                  </div>
                  
                  <div v-if="currentContract.landlord.phone" class="flex items-start">
                    <div class="flex-shrink-0 mt-0.5">
                      <i class="fas fa-phone text-gray-400"></i>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-gray-500">Téléphone</p>
                      <p class="text-sm font-medium text-gray-900">
                        {{ currentContract.landlord.phone }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click="contactLandlord"
                  class="mt-4 w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <i class="fas fa-envelope mr-2"></i>
                  Contacter le propriétaire
                </button>
              </div>
              <div v-else class="text-center py-4">
                <p class="text-sm text-gray-500">Information non disponible</p>
              </div>
            </div>
          </div>

          <!-- Carte Locataire -->
          <div class="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-md">
            <div class="px-6 py-5 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900 flex items-center">
                <i class="fas fa-user text-indigo-500 mr-2"></i>
                Locataire
              </h2>
            </div>
            <div class="p-6">
              <div v-if="authStore.user" class="space-y-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <i class="fas fa-user text-indigo-500 text-xl"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-base font-medium text-gray-900">
                      {{ authStore.user.firstName || '' }} {{ authStore.user.lastName || '' }}
                    </p>
                    <p class="text-sm text-indigo-600">Vous</p>
                  </div>
                </div>
                
                <div class="space-y-2 mt-4">
                  <div class="flex items-start">
                    <div class="flex-shrink-0 mt-0.5">
                      <i class="fas fa-envelope text-gray-400"></i>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-gray-500">Email</p>
                      <p class="text-sm font-medium text-gray-900 break-all">
                        {{ authStore.user.email || 'Non disponible' }}
                      </p>
                    </div>
                  </div>
                  
                  <div v-if="authStore.user.phone" class="flex items-start">
                    <div class="flex-shrink-0 mt-0.5">
                      <i class="fas fa-phone text-gray-400"></i>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-gray-500">Téléphone</p>
                      <p class="text-sm font-medium text-gray-900">
                        {{ authStore.user.phone }}
                      </p>
                    </div>
                  </div>
                  <div v-else class="flex items-start">
                    <div class="flex-shrink-0 mt-0.5">
                      <i class="fas fa-phone text-gray-400"></i>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-gray-500">Téléphone</p>
                      <p class="text-sm font-medium text-gray-900">
                        Non renseigné
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <p class="text-sm text-gray-500">Information non disponible</p>
              </div>
            </div>
          </div>

          <!-- Carte Documents -->
          <div class="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-md">
            <div class="px-6 py-5 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900 flex items-center">
                <i class="fas fa-folder-open text-indigo-500 mr-2"></i>
                Documents
              </h2>
            </div>
            <div class="p-6">
              <div class="space-y-3">
                <button 
                  @click="downloadContract"
                  class="group w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <i class="fas fa-file-pdf text-red-500 text-lg"></i>
                    </div>
                    <div class="ml-3 text-left">
                      <p class="text-sm font-medium text-gray-900">Contrat de location</p>
                      <p class="text-xs text-gray-500">PDF - Télécharger</p>
                    </div>
                  </div>
                  <i class="fas fa-download text-gray-400 group-hover:text-indigo-500 transition-colors"></i>
                </button>
                
                <button 
                  class="group w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                  disabled
                >
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <i class="fas fa-file-signature text-blue-400 text-lg"></i>
                    </div>
                    <div class="ml-3 text-left">
                      <p class="text-sm font-medium text-gray-400">État des lieux d'entrée</p>
                      <p class="text-xs text-gray-400">Non disponible</p>
                    </div>
                  </div>
                  <i class="fas fa-lock text-gray-300"></i>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Section de débogage (uniquement en développement) -->
          <div v-if="isDevelopment && currentContract" class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">
                <i class="fas fa-bug text-gray-400 mr-2"></i>
                Mode développement
              </h3>
            </div>
            <div class="p-4">
              <div class="space-y-4">
                <div>
                  <h4 class="text-xs font-medium text-gray-500 mb-1">Données du contrat :</h4>
                  <pre class="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-48">{{ JSON.stringify(currentContract, null, 2) }}</pre>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs font-medium text-gray-500 mb-1">hasAddress :</p>
                    <div class="text-xs bg-gray-50 p-2 rounded border border-gray-200">
                      {{ hasAddress(currentContract) }}
                    </div>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-500 mb-1">Adresse :</p>
                    <div class="text-xs bg-gray-50 p-2 rounded border border-gray-200">
                      {{ currentContract.property_address || 'Aucune adresse' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref, onMounted } from 'vue';
import { useRoute, useRouter, type Router } from 'vue-router';
import { useToast } from 'vue-toastification';
import api from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore } from '@/stores/contractStore';
import { useLandlordStore } from '@/stores/landlordStore';
import type { Contract, PropertyWithApartments, PropertyType } from '@/types/contract';
import type { FormLandlord, FormTenant } from '@/types/contract';

const route = useRoute();
const router: Router = useRouter();
const authStore = useAuthStore();
const contractStore = useContractStore();
const landlordStore = useLandlordStore();
const toast = useToast();

// Récupérer l'ID du contrat depuis l'URL
const contractId = computed(() => parseInt(route.params.id as string));

const currentContract = ref<Contract | null>(null);

// Fonctions d'aide pour l'affichage des propriétés
const getPropertyType = (property: any): string => {
  if (!property) return '';
  
  // Essayer de trouver le type dans différentes propriétés
  const type = property.type || property.property_type;
  if (!type) return '';
  
  const typeUpper = type.toString().toUpperCase();
  return propertyTypeLabels[typeUpper] || type;
};

const getPropertyTitle = (property: any): string => {
  if (!property) return 'Propriété sans nom';
  return property.title || property.property_title || 'Propriété sans nom';
};

const getPropertyArea = (property: any): string => {
  if (!property) return 'Non spécifiée';
  const area = property.area || property.property_area;
  return area ? `${area} m²` : 'Non spécifiée';
};

const getPropertyRooms = (property: any): string => {
  if (!property) return 'Non spécifié';
  const rooms = property.rooms || property.property_rooms;
  return rooms ? rooms.toString() : 'Non spécifié';
};

const getPropertyBathrooms = (property: any): string => {
  if (!property) return 'Non spécifié';
  const bathrooms = property.bathrooms || property.property_bathrooms;
  return bathrooms ? bathrooms.toString() : 'Non spécifié';
};

const getPropertyFloor = (property: any): string => {
  if (!property) return 'Non spécifié';
  const floor = property.floor || property.property_floor;
  
  if (floor === undefined || floor === null) return 'Non spécifié';
  return floor === 0 ? 'Rez-de-chaussée' : `Étage ${floor}`;
};

const getPropertyUsage = (property: any): string => {
  if (!property) return '';
  return property.usage || property.property_usage || '';
};



const loading = ref(true);
const error = ref<string | null>(null);

// Libellés pour les types de propriétés
const propertyTypeLabels: Record<string, string> = {
  'APPARTEMENT': 'Appartement',
  'MAISON': 'Maison',
  'VILLA': 'Villa',
  'CHATEAU': 'Château',
  'PARKING': 'Parking',
  'LOCAL_COMMERCIAL': 'Local commercial',
  'BUREAU': 'Bureau',
  'ENTREPOT': 'Entrepôt',
  'TERRAIN': 'Terrain',
  'AUTRE': 'Autre'
};

// Récupérer les détails du contrat
const showProperties = async () => {
  try {
    loading.value = true;
    const properties = await contractStore.fetchAllProperties();
    console.log('Propriétés récupérées:', properties);
    alert('Veuvez consulter la console du navigateur (F12) pour voir les propriétés');
  } catch (err) {
    console.error('Erreur lors de la récupération des propriétés:', err);
    error.value = 'Impossible de charger les propriétés';
  } finally {
    loading.value = false;
  }
};

const fetchContract = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Charger les contrats si ce n'est pas déjà fait
    if (contractStore.contracts.length === 0) {
      await contractStore.fetchContracts();
    }
    
    // Charger les bailleurs si ce n'est pas déjà fait
    if (landlordStore.landlords.length === 0) {
      await landlordStore.fetchLandlords();
    }
    
    // Vérifier si le contrat existe dans la liste
    const foundContract = contractStore.contracts.find(c => c.id === contractId.value);
    if (!foundContract) {
      throw new Error('Contrat non trouvé ou accès non autorisé');
    }
    
    // Mettre à jour currentContract avec foundContract
    currentContract.value = foundContract;
    
    // Trouver le bailleur correspondant
    const landlord = landlordStore.landlords.find(l => l._id === foundContract.landlordId);
    if (landlord) {
      foundContract.landlord = landlord;
    }
    
    // Afficher l'adresse du contrat dans la console
    console.log('Adresse du contrat:', foundContract.property_address);
    
  } catch (err: any) {
    console.error('Erreur lors du chargement du contrat:', err);
    
    if (err.message === 'Contrat non trouvé ou accès non autorisé') {
      error.value = 'Contrat introuvable ou accès refusé.';
      // Rediriger après un délai
      setTimeout(() => {
        router.push('/tenant/contracts');
      }, 3000);
    } else {
      error.value = 'Impossible de charger les détails du contrat. Veuillez réessayer.';
    }
  } finally {
    loading.value = false;
  }
};

// Vérifier si le contrat a une adresse valide
const hasAddress = (contract: any): boolean => {
  if (!contract) return false;
  return Boolean(contract?.property_address?.trim().length > 0);
}


// Libellé du type de propriété
const getPropertyTypeLabel = (type: string): string => {
  if (!type) return 'Type non spécifié';
  
  const types: Record<string, string> = {
    'appartement': 'Appartement',
    'maison': 'Maison',
    'bureau': 'Bureau',
    'local': 'Local commercial',
    'autre': 'Autre type de bien',
    'APPARTEMENT': 'Appartement',
    'MAISON': 'Maison',
    'BUREAU': 'Bureau',
    'LOCAL_COMMERCIAL': 'Local commercial',
    'VILLA': 'Villa',
    'CHATEAU': 'Château',
    'PARKING': 'Parking',
    'ENTREPOT': 'Entrepôt',
    'TERRAIN': 'Terrain'
  };
  
  return types[type] || type;
};

// Formater une date
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'Non spécifiée';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error('Erreur de formatage de date:', e);
    return 'Date invalide';
  }
};

// Formater une valeur monétaire
const formatCurrency = (amount: number | string | undefined): string => {
  if (amount === undefined || amount === null) return '0,00 €';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0,00 €';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currentContract.value?.currency || 'EUR'
  }).format(numAmount);
};

// Obtenir la classe CSS en fonction du statut
const getStatusClass = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'ended':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Obtenir le libellé du statut
const getStatusLabel = (status?: string): string => {
  if (!status) return 'Inconnu';
  
  switch (status.toLowerCase()) {
    case 'active':
      return 'Actif';
    case 'draft':
      return 'Brouillon';
    case 'pending':
      return 'En attente';
    case 'ended':
      return 'Terminé';
    default:
      return status;
  }
};

// Télécharger le contrat
const downloadContract = () => {
  // Implémentez la logique de téléchargement ici
  alert('Fonctionnalité de téléchargement à implémenter');
};

// Contacter le propriétaire
const contactLandlord = () => {
  if (!currentContract.value) return;
  
  // Implémentez la logique de contact ici
  const email = currentContract.value.landlord_email;
  if (email) {
    window.location.href = `mailto:${email}?subject=À propos du contrat #${currentContract.value.id}`;
  } else {
    alert('Aucune adresse email disponible pour ce propriétaire');
  }
};

// Fonction pour revenir en arrière
const goBack = () => {
  router.go(-1);
};



// Vérifier si on est en environnement de développement
const isDevelopment = ref(import.meta.env.DEV);

// Charger les données au montage du composant
onMounted(async () => {
  try {
    await fetchContract();
    console.log('Détails de la propriété:', currentContract.value?.property);
    console.log('Adresse de la propriété:', currentContract.value?.property?.address);
  } catch (error) {
    console.error('Erreur lors du chargement du contrat:', error);
  }
});
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
