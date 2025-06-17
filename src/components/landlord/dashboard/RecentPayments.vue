<template>
  <div class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-bold text-base">Vos paiements récents</h2>
      <button 
        aria-label="Next" 
        class="text-gray-600 hover:text-gray-900 text-lg focus:outline-none" 
        type="button"
        @click="nextPage"
      >
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>
    
    <table class="w-full text-left text-gray-700 text-xs border border-gray-200 rounded-lg overflow-hidden">
      <thead class="bg-white border-b border-gray-200">
        <tr>
          <th class="py-3 px-4 font-normal w-8">#</th>
          <th class="py-3 px-4 font-normal">Propriété</th>
          <th class="py-3 px-4 font-normal">Montant</th>
          <th class="py-3 px-4 font-normal">A utilisé sa garantie ?</th>
          <th class="py-3 px-4 font-normal">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(payment, index) in payments" 
          :key="index"
          class="border-b border-gray-200 hover:bg-gray-50"
        >
          <td class="py-3 px-4 font-mono text-gray-600">{{ index + 1 }}</td>
          <td class="py-3 px-4">{{ payment.property }}</td>
          <td class="py-3 px-4">{{ payment.amount }}</td>
          <td class="py-3 px-4">
            <span :class="{ 'text-green-600': !payment.usedGuarantee, 'text-red-600': payment.usedGuarantee }">
              {{ payment.usedGuarantee ? 'Oui' : 'Non' }}
            </span>
          </td>
          <td class="py-3 px-4">{{ payment.date }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const payments = ref([
  { 
    property: 'Appartement B20', 
    amount: '450$', 
    usedGuarantee: false, 
    date: '30/03/2024' 
  },
  { 
    property: 'Appartement B20', 
    amount: '450$', 
    usedGuarantee: false, 
    date: '30/02/2024' 
  },
  { 
    property: 'Appartement B20', 
    amount: '450$', 
    usedGuarantee: true, 
    date: '30/01/2024' 
  },
  { 
    property: 'Appartement B20', 
    amount: '450$', 
    usedGuarantee: false, 
    date: '30/12/2023' 
  },
  { 
    property: 'Appartement B20', 
    amount: '450$', 
    usedGuarantee: false, 
    date: '30/11/2023' 
  }
]);

const nextPage = () => {
  // Implement pagination logic
  console.log('Next page');
};
</script>
