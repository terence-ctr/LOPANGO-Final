<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Options personnalisées</h3>
    
    <!-- Premier champ de sélection -->
    <div class="mb-6">
      <label for="option1" class="block text-sm font-medium text-gray-700 mb-2">
        Option 1
      </label>
      <select
        id="option1"
        v-model="formData.option1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
      >
        <option value="">Sélectionnez une option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
    </div>
    <div class="mb-6">
     <textarea
      id="text1"
      v-model="formData.text1"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10" placeholder="Entrez votre texte"
    ></textarea>
    </div>
    <!-- Deuxième champ de sélection -->
    <div class="mb-6">
      <label for="option2" class="block text-sm font-medium text-gray-700 mb-2">
        Option 2
      </label>
      <select
        id="option2"
        v-model="formData.option2"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
      >
        <option value="">Sélectionnez une option</option>
        <option value="choiceA">Choix A</option>
        <option value="choiceB">Choix B</option>
        <option value="choiceC">Choix C</option>
      </select>
    </div>

    <!-- Cases à cocher indépendantes -->
    <div class="space-y-4">
      <h4 class="text-sm font-medium text-gray-700">Options supplémentaires :</h4>
      
      <div class="flex items-center">
        <input
          id="check1"
          v-model="formData.check1"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label for="check1" class="ml-2 block text-sm text-gray-700">
          Option supplémentaire 1
        </label>
      </div>

      <div class="flex items-center">
        <input
          id="check2"
          v-model="formData.check2"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label for="check2" class="ml-2 block text-sm text-gray-700">
          Option supplémentaire 2
        </label>
      </div>
    </div>

    <!-- Bouton de soumission -->
    <div class="mt-6">
      <button
        type="button"
        @click="saveOptions"
        class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Enregistrer les options
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import CustomOptionsService, { type CustomOptionData } from '@/services/customOptions.service';

const toast = useToast();
const emit = defineEmits(['saved']);

// Données du formulaire
const formData = ref<CustomOptionData>({
  option1: '',
  option2: '',
  text1: '',
  check1: false,
  check2: false,
});

// Charger les options existantes au montage du composant
onMounted(async () => {
  try {
    const options = await CustomOptionsService.getOptions();
    formData.value = { ...formData.value, ...options };
  } catch (error) {
    console.error('Erreur lors du chargement des options:', error);
  }
});

// Fonction pour sauvegarder les options
const saveOptions = async () => {
  try {
    const success = await CustomOptionsService.saveOptions(formData.value);
    
    if (success) {
      // Émettre un événement pour informer le composant parent
      emit('saved', formData.value);
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des options:', error);
  }
};

// Exposer les méthodes si nécessaire
defineExpose({
  getFormData: () => formData.value,
  resetForm: () => {
    formData.value = {
      option1: '',
      option2: '',
      check1: false,
      check2: false,
    };
  }
});
</script>
