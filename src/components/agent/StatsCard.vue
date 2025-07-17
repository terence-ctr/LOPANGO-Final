<template>
  <div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-center space-x-4">
      <div class="bg-[#1E4DB7] p-3 rounded-full text-white flex-shrink-0">
        <i :class="iconClass" class="text-lg"></i>
      </div>
      <div class="overflow-hidden">
        <p class="text-2xl font-bold text-gray-900 truncate">{{ value }}</p>
        <p class="text-sm text-gray-500 mt-1 truncate">{{ label }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  iconClass: string;
  value: string | number;
  label: string;
}

defineProps<Props>();
</script>
