<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestion des paiements</h1>
      <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" @click="openModal = true">
        Nouveau paiement
      </button>
    </div>

    <!-- Tableau des paiements -->
    <TransactionsTable :transactions="payments" />

    <!-- Modal de paiement -->
    <div v-if="openModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="closeModal">&times;</button>
        <h2 class="text-lg font-bold mb-4">Nouveau paiement</h2>
        <form @submit.prevent="submitPayment">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Montant <span class="text-red-500">*</span></label>
            <input v-model.number="form.amount" type="number" min="1" class="w-full border rounded px-3 py-2" required />
            <div v-if="errors.amount" class="text-red-500 text-xs mt-1">{{ errors.amount }}</div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Propriété concernée <span class="text-red-500">*</span></label>
            <select v-model="form.property_id" class="w-full border rounded px-3 py-2" required>
              <option value="">Sélectionner une propriété...</option>
              <option v-for="property in properties" :key="property.id" :value="property.id">
                {{ property.title }}
              </option>
            </select>
            <div v-if="errors.property_id" class="text-red-500 text-xs mt-1">{{ errors.property_id }}</div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Moyen de paiement <span class="text-red-500">*</span></label>
            <select v-model="form.payment_method" class="w-full border rounded px-3 py-2" required>
              <option value="">Sélectionner...</option>
              <option value="orange_money">Orange Money</option>
              <option value="airtel_money">Airtel Money</option>
              <option value="mpesa">M-Pesa</option>
            </select>
            <div v-if="errors.payment_method" class="text-red-500 text-xs mt-1">{{ errors.payment_method }}</div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Commentaire <span class="text-red-500">*</span></label>
            <textarea v-model="form.comment" class="w-full border rounded px-3 py-2" required></textarea>
            <div v-if="errors.comment" class="text-red-500 text-xs mt-1">{{ errors.comment }}</div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Date du paiement</label>
            <input v-model="form.date" type="date" class="w-full border rounded px-3 py-2" />
          </div>
          <div class="flex justify-end">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" :disabled="loading">
              {{ loading ? 'Envoi...' : 'Valider le paiement' }}
            </button>
          </div>
          <div v-if="success" class="text-green-600 mt-3">Paiement enregistré avec succès !</div>
          <div v-if="apiError" class="text-red-600 mt-3">{{ apiError }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import TransactionsTable from '@/components/agent/TransactionsTable.vue';
import { api } from '@/config/axios';

interface Payment {
  id: number;
  property: string;
  amount: string;
  guarantee: boolean;
  date: string;
  comment: string;
  payment_method?: string;
}

interface Property {
  id: number;
  title: string;
}

const payments = ref<Payment[]>([]);
const properties = ref<Property[]>([]);
const openModal = ref(false);
const loading = ref(false);
const success = ref(false);
const apiError = ref('');

const form = reactive({
  amount: 0,
  property_id: '',
  payment_method: '',
  comment: '',
  date: new Date().toISOString().slice(0, 10),
});

const errors = reactive({
  amount: '',
  property_id: '',
  payment_method: '',
  comment: '',
});

async function fetchPayments() {
  try {
    const response = await api.get('/payments');
    payments.value = (response.data.data || []).map((p: any) => ({
      ...p,
      amount: String(p.amount),
      guarantee: false, // Adapter si la donnée existe
      payment_method: p.payment_method || '',
      property: p.property || '',
    }));
  } catch (e: any) {
    apiError.value = e?.message || 'Erreur lors du chargement des paiements';
  }
}

async function fetchProperties() {
  try {
    // Adapter l'URL si besoin (ex: /properties ou /agent/properties)
    const response = await api.get('/properties');
    properties.value = response.data.data || [];
  } catch (e: any) {
    // Optionnel : afficher une erreur
  }
}

onMounted(() => {
  fetchPayments();
  fetchProperties();
});

function closeModal() {
  openModal.value = false;
  resetForm();
}

function resetForm() {
  form.amount = 0;
  form.property_id = '';
  form.payment_method = '';
  form.comment = '';
  form.date = new Date().toISOString().slice(0, 10);
  errors.amount = '';
  errors.property_id = '';
  errors.payment_method = '';
  errors.comment = '';
  success.value = false;
  apiError.value = '';
}

function validateForm() {
  let valid = true;
  errors.amount = form.amount > 0 ? '' : 'Le montant doit être supérieur à 0';
  errors.property_id = form.property_id ? '' : 'La propriété est requise';
  errors.payment_method = form.payment_method ? '' : 'Le moyen de paiement est obligatoire';
  errors.comment = form.comment ? '' : 'Le commentaire est obligatoire';
  if (errors.amount || errors.property_id || errors.payment_method || errors.comment) valid = false;
  return valid;
}

async function submitPayment() {
  if (!validateForm()) return;
  loading.value = true;
  apiError.value = '';
  success.value = false;
  try {
    const response = await api.post('/payments', {
      amount: form.amount,
      property_id: form.property_id,
      payment_method: form.payment_method,
      comment: form.comment,
      date: form.date,
    });
    if (response.data.status === 'success') {
      payments.value.push({
        id: response.data.data.id,
        property: properties.value.find(p => p.id === Number(form.property_id))?.title || '', amount: String(response.data.data.amount),
        guarantee: false,
        date: response.data.data.date,
        comment: response.data.data.comment,
        payment_method: response.data.data.payment_method,
      });
      success.value = true;
      setTimeout(() => {
        closeModal();
      }, 1000);
    } else {
      apiError.value = response.data.message || 'Erreur lors de l\'enregistrement du paiement';
    }
  } catch (e: any) {
    apiError.value = e?.response?.data?.message || e?.message || 'Erreur lors de l\'enregistrement du paiement';
  } finally {
    loading.value = false;
  }
}
</script> 