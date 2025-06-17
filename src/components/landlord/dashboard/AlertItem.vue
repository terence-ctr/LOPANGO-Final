<template>
  <div 
    class="flex items-start space-x-3 rounded-md p-3 text-xs"
    :class="alertClasses"
    role="alert"
  >
    <i class="fas fa-exclamation-triangle mt-0.5"></i>
    <p>
      <span class="font-semibold">{{ name }}</span>
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type AlertType = 'error' | 'warning' | 'info';

const props = defineProps<{
  type: AlertType;
  name: string;
  message: string;
}>();

const alertClasses = computed(() => {
  const base = 'flex items-start space-x-3 rounded-md p-3 text-xs';
  const typeClasses = {
    error: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-yellow-50 text-yellow-700'
  };
  
  return typeClasses[props.type] || typeClasses.info;
});
</script>
