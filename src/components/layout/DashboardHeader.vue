<template>
  <header class="bg-white shadow-sm sticky top-0 z-10">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Titre et sous-titre -->
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="mt-1 text-sm text-gray-500">
            {{ subtitle }}
          </p>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center space-x-3">
          <!-- Bouton d'action principal -->
          <button
            v-if="primaryAction"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="primaryAction.handler"
          >
            <component 
              v-if="primaryAction.icon" 
              :is="primaryAction.icon" 
              class="-ml-1 mr-2 h-5 w-5" 
              aria-hidden="true" 
            />
            {{ primaryAction.label }}
          </button>
          
          <!-- Boutons d'action secondaires -->
          <div class="hidden md:flex items-center space-x-2">
            <button
              v-for="(action, index) in secondaryActions"
              :key="index"
              type="button"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="action.handler"
            >
              <component 
                v-if="action.icon" 
                :is="action.icon" 
                class="-ml-0.5 mr-2 h-4 w-4" 
                aria-hidden="true" 
              />
              {{ action.label }}
            </button>
          </div>
          
          <!-- Menu déroulant pour les actions sur mobile -->
          <Menu as="div" class="relative inline-block text-left md:hidden">
            <MenuButton class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500">
              Actions
              <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
            </MenuButton>
            
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div class="py-1">
                  <MenuItem 
                    v-for="(action, index) in secondaryActions" 
                    :key="`mobile-${index}`"
                    v-slot="{ active }"
                  >
                    <button
                      :class="[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'group flex items-center px-4 py-2 text-sm w-full text-left'
                      ]"
                      @click="action.handler"
                    >
                      <component 
                        v-if="action.icon" 
                        :is="action.icon" 
                        class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" 
                        aria-hidden="true" 
                      />
                      {{ action.label }}
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
      
      <!-- Barre de chargement -->
      <div v-if="loading" class="h-1 w-full bg-gray-200 overflow-hidden">
        <div class="h-full bg-blue-600 animate-pulse" style="width: 100%;"></div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { ChevronDownIcon } from '@heroicons/vue/outline';

interface Action {
  label: string;
  handler: () => void;
  icon?: any;
  disabled?: boolean;
}

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  primaryAction: {
    type: Object as () => Action | null,
    default: null
  },
  secondaryActions: {
    type: Array as () => Action[],
    default: () => []
  }
});

// Émettre des événements pour les actions
const emit = defineEmits<{
  (e: 'primary-action'): void;
  (e: 'secondary-action', action: Action): void;
}>();

// Gérer les actions
const handlePrimaryAction = () => {
  if (props.primaryAction) {
    emit('primary-action');
    props.primaryAction.handler();
  }
};

const handleSecondaryAction = (action: Action) => {
  emit('secondary-action', action);
  action.handler();
};

// Mettre à jour le titre du document
const route = useRoute();
watch(
  () => props.title,
  (newTitle) => {
    document.title = `${newTitle} | Lopango`;
  },
  { immediate: true }
);
</script>
