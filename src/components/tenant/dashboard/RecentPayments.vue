<template>
  <section class="bg-white rounded-xl shadow-md p-4 sm:p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-extrabold text-base">
        Vos paiements récents
      </h2>
      <router-link 
        to="/tenant/payments" 
        class="text-gray-400 hover:text-gray-700 text-lg"
        aria-label="Voir tous les paiements"
      >
        <font-awesome-icon :icon="['fas', 'arrow-right']" />
      </router-link>
    </div>
    
    <!-- Version Desktop (tableau) -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-xs sm:text-sm text-gray-600 border border-gray-200 rounded-lg">
        <thead>
          <tr class="border-b border-gray-200 text-left">
            <th class="py-3 px-3 font-semibold w-10">#</th>
            <th class="py-3 px-3 font-semibold">Propriété</th>
            <th class="py-3 px-3 font-semibold w-24">Montant</th>
            <th class="py-3 px-3 font-semibold w-36">Garantie utilisée</th>
            <th class="py-3 px-3 font-semibold w-32">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(payment, index) in payments" 
            :key="`desktop-${payment.id}`" 
            class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <td class="py-3 px-3 font-mono">
              {{ String(index + 1).padStart(2, '0') }}
            </td>
            <td class="py-3 px-3 font-medium">
              {{ payment.property }}
            </td>
            <td class="py-3 px-3 font-medium">
              {{ payment.amount }}
            </td>
            <td class="py-3 px-3">
              <span 
                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                :class="payment.usedGuarantee ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
              >
                {{ payment.usedGuarantee ? 'Oui' : 'Non' }}
              </span>
            </td>
            <td class="py-3 px-3 text-gray-500">
              {{ payment.date }}
            </td>
          </tr>
          
          <tr v-if="payments.length === 0">
            <td colspan="5" class="py-4 text-center text-gray-500 text-sm">
              Aucun paiement récent
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Version Mobile (cartes) -->
    <div class="md:hidden space-y-3">
      <div 
        v-for="(payment, index) in payments" 
        :key="`mobile-${payment.id}`"
        class="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div class="font-medium text-gray-900">
            {{ payment.property }}
          </div>
          <div class="text-sm font-mono text-gray-500">
            #{{ String(index + 1).padStart(2, '0') }}
          </div>
        </div>
        
        <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-600">Montant:</div>
          <div class="font-medium">{{ payment.amount }}</div>
          
          <div class="text-gray-600">Date:</div>
          <div class="text-gray-700">{{ payment.date }}</div>
          
          <div class="text-gray-600">Garantie:</div>
          <div>
            <span 
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
              :class="payment.usedGuarantee ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
            >
              {{ payment.usedGuarantee ? 'Utilisée' : 'Non utilisée' }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="payments.length === 0" class="text-center py-4 text-gray-500">
        Aucun paiement récent
      </div>
    </div>
    
    <div v-if="showViewAll && payments.length > 0" class="mt-4 md:mt-6 text-center">
      <router-link 
        to="/tenant/payments" 
        class="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
      >
        Voir tous les paiements
        <font-awesome-icon :icon="['fas', 'arrow-right']" class="ml-1 text-xs" />
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineProps, withDefaults } from 'vue';

interface Payment {
  id: number | string;
  property: string;
  amount: string;
  usedGuarantee: boolean;
  date: string;
}

const props = withDefaults(defineProps<{
  payments?: Payment[];
  showViewAll?: boolean;
}>(), {
  payments: () => [],
  showViewAll: true
});
</script>
