<template>
  <div class="complaints-view">
    <h1 class="text-2xl font-bold mb-6">Mes réclamations</h1>
    
    <!-- Empty state -->
    <div v-if="complaints.length === 0" class="bg-white rounded-lg shadow p-6 text-center">
      <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">Aucune réclamation</h3>
      <p class="text-gray-500 mb-4">Vous n'avez pas encore créé de réclamation.</p>
      <button 
        @click="showCreateForm = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Nouvelle réclamation
      </button>
    </div>

    <!-- Complaints list -->
    <div v-else class="space-y-4">
      <div class="flex justify-end mb-4">
        <button 
          @click="showCreateForm = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nouvelle réclamation
        </button>
      </div>

      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="complaint in complaints" :key="complaint.id">
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-indigo-600 truncate">
                  {{ complaint.title }}
                </p>
                <div class="ml-2 flex-shrink-0 flex">
                  <p :class="statusBadgeClass(complaint.status)">
                    {{ formatStatus(complaint.status) }}
                  </p>
                </div>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="sm:flex">
                  <p class="flex items-center text-sm text-gray-500">
                    <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                    </svg>
                    {{ formatDate(complaint.createdAt) }}
                  </p>
                </div>
                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  {{ complaint.property }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Create Complaint Modal -->
    <div v-if="showCreateForm" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Nouvelle réclamation
              </h3>
              <div class="mt-2">
                <form @submit.prevent="createComplaint">
                  <div class="space-y-4">
                    <div>
                      <label for="property" class="block text-sm font-medium text-gray-700 text-left">Bien concerné</label>
                      <select 
                        id="property" 
                        v-model="newComplaint.propertyId"
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="" disabled>Sélectionnez un bien</option>
                        <option v-for="property in properties" :key="property.id" :value="property.id">
                          {{ property.address }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label for="title" class="block text-sm font-medium text-gray-700 text-left">Titre</label>
                      <input 
                        type="text" 
                        id="title" 
                        v-model="newComplaint.title" 
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Titre de la réclamation"
                        required
                      >
                    </div>
                    <div>
                      <label for="description" class="block text-sm font-medium text-gray-700 text-left">Description</label>
                      <textarea 
                        id="description" 
                        v-model="newComplaint.description" 
                        rows="4"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Décrivez votre réclamation en détail..."
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 text-left">Pièces jointes</label>
                      <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div class="space-y-1 text-center">
                          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                          <div class="flex text-sm text-gray-600">
                            <label class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                              <span>Téléverser des fichiers</span>
                              <input type="file" class="sr-only" multiple @change="handleFileUpload">
                            </label>
                            <p class="pl-1">ou glissez-déposez</p>
                          </div>
                          <p class="text-xs text-gray-500">
                            PNG, JPG, PDF jusqu'à 10MB
                          </p>
                        </div>
                      </div>
                      <div v-if="newComplaint.attachments.length > 0" class="mt-2">
                        <p class="text-sm text-gray-500 mb-2">Fichiers sélectionnés :</p>
                        <ul class="space-y-2">
                          <li v-for="(file, index) in newComplaint.attachments" :key="index" class="flex items-center justify-between text-sm">
                            <span class="truncate w-3/4">{{ file.name }}</span>
                            <button 
                              type="button" 
                              @click="removeAttachment(index)"
                              class="text-red-600 hover:text-red-800"
                            >
                              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                              </svg>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button 
                      type="submit" 
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                      :disabled="isSubmitting"
                    >
                      <span v-if="isSubmitting" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </span>
                      <span v-else>Envoyer la réclamation</span>
                    </button>
                    <button 
                      type="button" 
                      @click="showCreateForm = false"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      :disabled="isSubmitting"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';

export default defineComponent({
  name: 'ComplaintsView',
  
  setup() {
    const authStore = useAuthStore();
    const toast = useToast();
    
    const complaints = ref([
      // Mock data - replace with actual API call
      {
        id: '1',
        title: 'Fuite dans la salle de bain',
        status: 'pending',
        property: 'Appartement 12, Rue de Paris',
        createdAt: '2023-05-15T10:30:00Z',
        description: 'Il y a une fuite sous le lavabo de la salle de bain principale.'
      },
      {
        id: '2',
        title: 'Chauffe-eau en panne',
        status: 'in_progress',
        property: 'Appartement 12, Rue de Paris',
        createdAt: '2023-05-10T14:20:00Z',
        description: 'Le chauffe-eau ne fonctionne plus depuis hier soir.'
      },
      {
        id: '3',
        title: 'VMC bruyante',
        status: 'resolved',
        property: 'Appartement 12, Rue de Paris',
        createdAt: '2023-04-28T09:15:00Z',
        description: 'La VMC fait un bruit anormal depuis quelques jours.'
      }
    ]);
    
    const properties = ref([
      // Mock data - replace with actual API call
      { id: '1', address: 'Appartement 12, Rue de Paris' },
      { id: '2', address: 'Maison 5, Avenue des Champs-Élysées' }
    ]);
    
    const showCreateForm = ref(false);
    const isSubmitting = ref(false);
    
    const newComplaint = ref({
      propertyId: '',
      title: '',
      description: '',
      attachments: [] as File[]
    });
    
    const statusBadgeClass = (status: string) => {
      const classes = {
        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
        'bg-yellow-100 text-yellow-800': status === 'pending',
        'bg-blue-100 text-blue-800': status === 'in_progress',
        'bg-green-100 text-green-800': status === 'resolved',
        'bg-red-100 text-red-800': status === 'rejected'
      };
      return Object.entries(classes).filter(([_, value]) => value).map(([key]) => key).join(' ');
    };
    
    const formatStatus = (status: string) => {
      const statusMap: Record<string, string> = {
        pending: 'En attente',
        in_progress: 'En cours',
        resolved: 'Résolu',
        rejected: 'Rejeté'
      };
      return statusMap[status] || status;
    };
    
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const files = Array.from(target.files);
        newComplaint.value.attachments = [...newComplaint.value.attachments, ...files];
      }
    };
    
    const removeAttachment = (index: number) => {
      newComplaint.value.attachments.splice(index, 1);
    };
    
    const createComplaint = async () => {
      if (!newComplaint.value.propertyId || !newComplaint.value.title || !newComplaint.value.description) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      isSubmitting.value = true;
      
      try {
        // Here you would typically make an API call to create the complaint
        // For example:
        // await api.post('/api/tenant/complaints', {
        //   propertyId: newComplaint.value.propertyId,
        //   title: newComplaint.value.title,
        //   description: newComplaint.value.description,
        //   attachments: newComplaint.value.attachments
        // });
        
        // Mock API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Add the new complaint to the list (in a real app, this would come from the API response)
        complaints.value.unshift({
          id: (complaints.value.length + 1).toString(),
          title: newComplaint.value.title,
          status: 'pending',
          property: properties.value.find(p => p.id === newComplaint.value.propertyId)?.address || '',
          createdAt: new Date().toISOString(),
          description: newComplaint.value.description
        });
        
        // Reset form
        newComplaint.value = {
          propertyId: '',
          title: '',
          description: '',
          attachments: []
        };
        
        showCreateForm.value = false;
        
        toast.success('Votre réclamation a été enregistrée avec succès');
      } catch (error) {
        console.error('Error creating complaint:', error);
        toast.error('Une erreur est survenue lors de l\'enregistrement de votre réclamation');
      } finally {
        isSubmitting.value = false;
      }
    };
    
    // In a real app, you would fetch the complaints and properties from your API
    const fetchComplaints = async () => {
      try {
        // Example: const response = await api.get('/api/tenant/complaints');
        // complaints.value = response.data;
      } catch (error) {
        console.error('Error fetching complaints:', error);
        toast.error('Impossible de charger les réclamations');
      }
    };
    
    const fetchProperties = async () => {
      try {
        // Example: const response = await api.get('/api/tenant/properties');
        // properties.value = response.data;
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Impossible de charger vos biens');
      }
    };
    
    onMounted(() => {
      fetchComplaints();
      fetchProperties();
    });
    
    return {
      complaints,
      properties,
      showCreateForm,
      isSubmitting,
      newComplaint,
      statusBadgeClass,
      formatStatus,
      formatDate,
      handleFileUpload,
      removeAttachment,
      createComplaint,
      authStore
    };
  }
});
</script>

<style scoped>
.complaints-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

@media (min-width: 1024px) {
  .complaints-view {
    padding: 2rem;
  }
}
</style>
