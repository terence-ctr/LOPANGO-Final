<template>
  <div class="border border-gray-200 rounded-lg p-4">
    <div class="flex items-center space-x-3">
      <div class="bg-[#1E4DB7] p-2 rounded-full text-white">
        <i :class="iconClass" class="text-sm"></i>
      </div>
      <div>
        <p class="text-lg font-bold">{{ value }}</p>
        <p class="text-sm text-gray-600">{{ label }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  iconClass: string
  value: string | number
  label: string
}

const props = defineProps<Props>()
</script>
