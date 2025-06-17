<template>
  <div class="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
    <h3 class="font-bold mb-4">Alertes</h3>
    <div class="space-y-4">
      <AlertItem 
        v-for="(alert, index) in alerts" 
        :key="index"
        :type="alert.type"
        :name="alert.name"
        :message="alert.message"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AlertItem from './AlertItem.vue';

const alerts = ref([
  { 
    type: 'error', 
    name: 'Marcel Senga', 
    message: 'a dépassé son ultimatum de loyer.' 
  },
  { 
    type: 'warning', 
    name: 'Marcel Senga', 
    message: 'est très proche de son ultimatum de loyer' 
  },
  { 
    type: 'warning', 
    name: 'Jason Isamene', 
    message: 'est très proche de son ultimatum de loyer' 
  },
  { 
    type: 'info', 
    name: 'Elie Oko', 
    message: 'est très proche de son ultimatum de loyer' 
  }
]);
</script>
