<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Mes biens immobiliers</h1>
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <button 
          @click="showAddPropertyForm = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <i class="fas fa-plus"></i>
          <span>Ajouter un bien</span>
        </button>
      </div>
      
      <!-- Liste des propriétés -->
      <div v-if="properties.length > 0" class="divide-y divide-gray-200">
        <!-- Ici, vous pouvez ajouter la liste des propriétés -->
      </div>
      
      <div v-else class="p-8 text-center">
        <div class="text-gray-400 mb-4">
          <i class="fas fa-home text-4xl"></i>
        </div>
        <p class="text-gray-500 mb-4">Aucun bien enregistré pour le moment.</p>
        <button 
          @click="showAddPropertyForm = true"
          class="text-blue-600 hover:text-blue-800 font-medium"
        >
          Ajouter votre premier bien
        </button>
      </div>
    </div>
    
    <!-- Modal pour ajouter une propriété -->
    <div v-if="showAddPropertyForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold">Ajouter un nouveau bien</h2>
            <button 
              @click="showAddPropertyForm = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <PropertyForm 
            @submit="handlePropertyAdded"
            @cancel="showAddPropertyForm = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PropertyForm from '@/components/landlord/properties/PropertyForm.vue';

// État pour contrôler l'affichage du formulaire
const showAddPropertyForm = ref(false);

// Liste des propriétés (à remplacer par les données réelles)
const properties = ref([]);

// Gérer l'ajout d'une propriété
const handlePropertyAdded = (property) => {
  console.log('Nouvelle propriété ajoutée:', property);
  // Ajouter la propriété à la liste
  properties.value.unshift(property);
  // Fermer le formulaire
  showAddPropertyForm.value = false;
  // Vous pourriez aussi recharger la liste des propriétés depuis l'API ici
};
</script>

<style scoped>
/* Styles pour le modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
