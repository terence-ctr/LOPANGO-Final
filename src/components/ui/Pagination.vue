<template>
  <div v-if="totalPages > 1" class="flex flex-col sm:flex-row justify-between items-center mt-3 gap-2">
    <!-- Informations de pagination -->
    <div class="text-xs text-gray-500">
      <span class="text-gray-600">Page</span>
      <span class="font-medium text-gray-900">{{ currentPage }}</span>
      <span class="text-gray-600">sur</span>
      <span class="font-medium text-gray-900">{{ totalPages }}</span>
    </div>

    <!-- Navigation -->
    <div class="flex items-center space-x-1">
      <!-- Première page -->
      <button 
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        class="p-1.5 rounded-md border border-gray-300"
        :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
        title="Première page"
      >
        <i class="fas fa-angle-double-left text-xs"></i>
      </button>

      <!-- Page précédente -->
      <button 
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="p-1.5 rounded-md border border-gray-300"
        :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
        title="Page précédente"
      >
        <i class="fas fa-chevron-left text-xs"></i>
      </button>

      <!-- Pages numérotées -->
      <template v-for="page in visiblePages" :key="page">
        <span 
          v-if="page === '...'"
          class="p-1.5 text-gray-500"
        >
          <span class="text-xs">{{ page }}</span>
        </span>
        <button 
          v-else
          @click="goToPage(Number(page))"
          class="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center"
          :class="currentPage === Number(page) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          <span class="text-xs">{{ page }}</span>
        </button>
      </template>

      <!-- Page suivante -->
      <button 
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="p-1.5 rounded-md border border-gray-300"
        :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
        title="Page suivante"
      >
        <i class="fas fa-chevron-right text-xs"></i>
      </button>

      <!-- Dernière page -->
      <button 
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        class="p-1.5 rounded-md border border-gray-300"
        :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
        title="Dernière page"
      >
        <i class="fas fa-angle-double-right text-xs"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';

interface Props {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:currentPage']);

// Calcul des pages visibles
const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;
  
  // Calculer le début et la fin des pages visibles
  let start = Math.max(1, props.currentPage - 2);
  let end = Math.min(props.totalPages, props.currentPage + 2);
  
  // Ajuster si nécessaire
  if (end - start < maxVisiblePages - 1) {
    if (start === 1) {
      end = Math.min(props.totalPages, start + maxVisiblePages - 1);
    } else {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
  }

  // Ajouter la première page si nécessaire
  if (start > 2) {
    pages.push(1);
    if (start > 3) pages.push('...');
  }

  // Ajouter les pages visibles
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Ajouter la dernière page si nécessaire
  if (end < props.totalPages - 1) {
    if (end < props.totalPages - 2) pages.push('...');
    pages.push(props.totalPages);
  }

  return pages;
});

// Gestion du changement de page
const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page);
  }
};

// Convertir une page en nombre
const toNumber = (value: string | number): number => {
  return typeof value === 'string' ? parseInt(value, 10) : value;
};
</script>
