<template>
  <router-link 
    :to="item.to"
    class="nav-item flex items-center gap-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
    :class="{
      'bg-blue-700': isActive,
      'collapsed': isCollapsed
    }"
    :aria-label="item.label"
  >
    <font-awesome-icon :icon="['fas', item.icon]" class="text-lg min-w-5 text-center" />
    <span class="nav-text transition-opacity duration-200">{{ item.label }}</span>
    
    <!-- Badge pour les notifications -->
    <span 
      v-if="item.badge" 
      class="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
      :class="{ 'opacity-0': isCollapsed }"
    >
      {{ item.badge }}
    </span>
  </router-link>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps({
  item: {
    type: Object,
    required: true,
    validator: (value: any) => {
      return ['to', 'icon', 'label'].every(prop => prop in value);
    }
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCollapsed: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.nav-item {
  position: relative;
  overflow: hidden;
}

.nav-item::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background-color: #3b82f6;
  transition: height 0.2s ease;
}

.nav-item:hover::after,
.nav-item.router-link-active::after {
  height: 60%;
}

/* Animation pour les éléments actifs */
.router-link-active {
  font-weight: 600;
  background-color: rgba(59, 130, 246, 0.2);
}

/* Style pour les écrans tactiles */
@media (hover: none) {
  .nav-item:active {
    background-color: rgba(59, 130, 246, 0.3);
  }
}
</style>
