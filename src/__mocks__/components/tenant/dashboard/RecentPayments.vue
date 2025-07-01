<template>
  <div class="recent-payments-mock">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Paiements Récents (Mock)</h3>
    <div class="bg-white rounded-lg shadow p-4">
      <p class="text-sm text-gray-500 mb-3">Fonctionnalité de paiement désactivée</p>
      <div class="space-y-3">
        <div v-for="i in 3" :key="i" class="flex items-center p-2 border-b border-gray-100">
          <div class="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span class="text-gray-500 text-xs">€</span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">Paiement #{{ i }}</p>
            <p class="text-xs text-gray-500">Date: 01/0{{ i }}/2025</p>
          </div>
          <div class="ml-auto text-right">
            <p class="text-sm font-medium text-gray-900">500,00 €</p>
            <p class="text-xs text-gray-500">En attente</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RecentPaymentsMock',
  props: {
    // Ajoutez des props si nécessaire pour la compatibilité
  },
  setup() {
    return {};
  },
});
</script>

<style scoped>
.recent-payments-mock {
  opacity: 0.7;
}
</style>
