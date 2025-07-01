<template>
  <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold mb-6">Nouveau contrat</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Contract Details -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Détails du contrat</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Contract Name -->
          <div class="col-span-2">
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nom du contrat <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>

          <!-- Property Address -->
          <div class="col-span-2">
            <label for="address" class="block text-sm font-medium text-gray-700">
              Adresse du bien <span class="text-red-500">*</span>
            </label>
            <input
              id="address"
              v-model="formData.address"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>

          <!-- Tenant Name -->
          <div>
            <label for="tenant" class="block text-sm font-medium text-gray-700">
              Locataire <span class="text-red-500">*</span>
            </label>
            <input
              id="tenant"
              v-model="formData.tenant"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>


          <!-- Start Date -->
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700">
              Date de début <span class="text-red-500">*</span>
            </label>
            <input
              id="startDate"
              v-model="formData.startDate"
              type="date"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>


          <!-- End Date -->
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700">
              Date de fin
            </label>
            <input
              id="endDate"
              v-model="formData.endDate"
              type="date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>

          <!-- Status -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">
              Statut <span class="text-red-500">*</span>
            </label>
            <select
              id="status"
              v-model="formData.status"
              required
              class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="ended">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="handleCancel"
          class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Annuler
        </button>
        <button
          type="submit"
          class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Enregistrer
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['submitted', 'cancel']);

// Form data with TypeScript interface
type ContractStatus = 'active' | 'pending' | 'ended' | 'cancelled';

interface ContractFormData {
  name: string;
  address: string;
  tenant: string;
  startDate: string;
  endDate: string | null;
  status: ContractStatus;
}

const formData = ref<ContractFormData>({
  name: '',
  address: '',
  tenant: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: null,
  status: 'active'
});

// Handle form submission
const handleSubmit = () => {
  // Basic validation
  if (!formData.value.name || !formData.value.address || !formData.value.tenant || !formData.value.startDate) {
    return;
  }

  // Emit the form data to parent component
  emit('submitted', {
    ...formData.value,
    id: Date.now().toString(), // Generate a temporary ID
    startDate: new Date(formData.value.startDate),
    endDate: formData.value.endDate ? new Date(formData.value.endDate) : null
  });
};

// Handle cancel button click
const handleCancel = () => {
  emit('cancel');
};
</script>
