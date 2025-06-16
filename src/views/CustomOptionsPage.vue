<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Options personnalisées</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Formulaire des options personnalisées -->
        <div class="lg:col-span-1">
          <CustomOptionsForm 
            ref="customForm"
            @saved="handleOptionsSaved"
            class="sticky top-4"
          />
        </div>
     
        <!-- Aperçu des données sélectionnées -->
        <div class="lg:col-span-2">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Aperçu des options sélectionnées</h2>
            
            <div class="space-y-4">
              <div>
                <h3 class="font-medium text-gray-700">Option 1 :</h3>
                <p class="text-gray-600">{{ previewData.option1 || 'Non sélectionnée' }}</p>
              </div>
              
              <div>
                <h3 class="font-medium text-gray-700">Option 2 :</h3>
                <p class="text-gray-600">{{ previewData.option2 || 'Non sélectionnée' }}</p>
              </div>
              <div>
                <h3 class="font-medium text-gray-700">Texte :</h3>
                <p class="text-gray-600">{{ previewData.text1 || 'aucun texte' }}</p>
              </div>
              <div>
                <h3 class="font-medium text-gray-700">Options supplémentaires :</h3>
                <ul class="list-disc list-inside text-gray-600">
                  <li v-if="previewData.check1">Option supplémentaire 1</li>
                  <li v-if="previewData.check2">Option supplémentaire 2</li>
                  <li v-if="!previewData.check1 && !previewData.check2">Aucune option supplémentaire sélectionnée</li>
                </ul>
              </div>
              
              <div v-if="lastSaved" class="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                Dernière sauvegarde : {{ formatDateTime(lastSaved) }}
              </div>
            </div>
            
            <!-- Bouton pour réinitialiser le formulaire -->
            <div class="mt-6">
              <button
                @click="resetForm"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.277z" clip-rule="evenodd" />
                </svg>
                Réinitialiser le formulaire
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import CustomOptionsForm from '@/components/shared/CustomOptionsForm.vue';

const router = useRouter();
const toast = useToast();
const customForm = ref<InstanceType<typeof CustomOptionsForm> | null>(null);
const lastSaved = ref<Date | null>(null);

// Données pour l'aperçu
const previewData = ref({
  option1: '',
  option2: '',
  text1: '',
  check1: false,
  check2: false
});

// Mettre à jour l'aperçu lorsque les options sont sauvegardées
const handleOptionsSaved = (data: any) => {
  previewData.value = { ...data };
  lastSaved.value = new Date();
  
  // Afficher une notification
  toast.success('Les options ont été mises à jour avec succès !');
};

// Réinitialiser le formulaire
const resetForm = () => {
  if (customForm.value) {
    customForm.value.resetForm();
    previewData.value = {
      option1: '',
      option2: '',
      text1: '',
      check1: false,
      check2: false
    };
    lastSaved.value = null;
    toast.info('Le formulaire a été réinitialisé');
  }
};

// Formater la date et l'heure pour l'affichage
const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

// Charger les données sauvegardées au montage du composant
onMounted(() => {
  // Ici, vous pourriez charger les données précédemment sauvegardées
  // depuis votre API ou un store
  console.log('Page des options personnalisées chargée');
});
</script>

<style scoped>
/* Styles spécifiques à cette page si nécessaire */
.container {
  max-width: 1200px;
}

.sticky {
  position: sticky;
  top: 1rem;
}
</style>
