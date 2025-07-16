<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h3 class="font-semibold text-sm mb-4">Alertes</h3>
    <div class="space-y-3 text-sm">
      <div v-for="alert in alerts" :key="alert.id" class="flex items-start space-x-2 p-2 rounded">
        <i class="fas fa-exclamation-triangle mt-0.5" :class="alert.colorClass"></i>
        <p class="text-gray-700">
          <span class="font-semibold">{{ alert.name }}</span>
          {{ alert.message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Alert {
  id: number
  name: string
  message: string
  colorClass: string
}

interface Props {
  alerts: Alert[]
}

const props = defineProps<Props>()
</script>
