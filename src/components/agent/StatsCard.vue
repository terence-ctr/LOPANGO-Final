<template>
  <div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow h-full">
    <div class="flex items-start space-x-4 h-full">
      <div class="bg-[#1E4DB7] p-3 rounded-lg text-white flex-shrink-0 mt-1">
        <i :class="iconClass" class="text-xl"></i>
      </div>
      <div class="overflow-hidden flex-1">
        <p class="text-2xl font-bold text-gray-900 mb-1">{{ value }}</p>
        <p class="text-sm font-medium text-gray-800">{{ label }}</p>
        <p v-if="description" class="text-xs text-gray-500 mt-1">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  iconClass: string;
  value: string | number;
  label: string;
  description?: string;
}

defineProps<Props>();
</script>
