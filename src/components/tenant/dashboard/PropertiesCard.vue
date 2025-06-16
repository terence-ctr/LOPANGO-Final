<template>
  <section class="bg-white rounded-xl shadow-md p-6">
    <div class="flex items-center space-x-4 mb-6">
      <div class="flex items-center justify-center w-16 h-16 bg-blue-800 rounded-md text-white font-extrabold text-3xl flex-shrink-0">
        {{ properties.length }}
      </div>
      <div class="flex-1">
        <p class="text-sm text-gray-600">
          Les propriétés
        </p>
        <router-link to="/tenant/properties" class="text-xs text-blue-600 flex items-center space-x-1 mt-1 font-semibold hover:underline">
          <span>Tout voir</span>
          <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs" />
        </router-link>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full border border-gray-200 rounded-lg text-left text-xs text-gray-600">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="py-2 px-3 font-semibold w-10">#</th>
            <th class="py-2 px-3 font-semibold">Nom de la propriété</th>
            <th class="py-2 px-3 font-semibold w-24">Statut</th>
            <th class="py-2 px-3 w-6"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(property, index) in properties" :key="property.id" class="border-b border-gray-200">
            <td class="py-2 px-3 font-mono text-gray-700">{{ String(index + 1).padStart(2, '0') }}</td>
            <td class="py-2 px-3">{{ property.name }}</td>
            <td class="py-2 px-3">
              <span class="text-green-600 font-semibold">
                {{ property.status === 'active' ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td class="py-2 px-3 text-gray-400 cursor-pointer">
              <font-awesome-icon :icon="['fas', 'ellipsis-v']" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
  properties: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>
