<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  isMobile: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.user?.role === 'admin')

const navigationItems = computed(() => [
  { 
    name: 'Dashboard', 
    icon: 'home', 
    route: 'landlord-dashboard' 
  },
  { 
    name: 'Properties', 
    icon: 'building', 
    route: 'landlord-properties'
  },
  { 
    name: 'Tenants', 
    icon: 'users', 
    route: 'landlord-tenants'
  },
  { 
    name: 'Financial', 
    icon: 'chart-pie', 
    route: 'landlord-payments' 
  },
  { 
    name: 'Maintenance', 
    icon: 'wrench', 
    route: 'landlord-maintenance' 
  },
  { 
    name: 'Documents', 
    icon: 'document-text', 
    route: 'landlord-documents' 
  },
  { 
    name: 'Calendar', 
    icon: 'calendar', 
    route: 'landlord-calendar' 
  },
  { 
    name: 'Options', 
    icon: 'cog', 
    route: 'landlord-custom-options' 
  },
  ...isAdmin.value ? [{ 
    name: 'Users', 
    icon: 'user-group', 
    route: 'users' 
  }] : []
])

const isActive = (routeName: string) => {
  return route.name === routeName
}

const navigate = (routeName: string) => {
  router.push({ name: routeName })
  emit('close')
}

const logout = () => {
  authStore.logout()
}
</script>

<template>
  <aside 
    class="fixed inset-y-0 left-0 bg-white shadow-lg z-30 w-64 transition-all duration-300 transform" 
    :class="[
      isOpen ? 'translate-x-0' : '-translate-x-full',
      isMobile ? 'md:translate-x-0' : ''
    ]"
  >
    <!-- Logo and close button (mobile only) -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
      <div class="flex items-center">
        <span class="text-xl font-semibold text-primary-600">PropManage</span>
      </div>
      <button 
        v-if="isMobile" 
        class="text-gray-500 hover:text-gray-700 focus:outline-none" 
        @click="emit('close')"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <!-- Navigation links -->
    <nav class="mt-5 px-2 space-y-1">
      <div 
        v-for="item in navigationItems" 
        :key="item.route" 
        class="group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer transition-colors duration-200"
        :class="[
          isActive(item.route) 
            ? 'bg-primary-50 text-primary-700' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        ]"
        @click="navigate(item.route)"
      >
        <div 
          class="mr-3 h-6 w-6 transition-colors duration-200" 
          :class="[
            isActive(item.route) 
              ? 'text-primary-500' 
              : 'text-gray-400 group-hover:text-gray-500'
          ]"
        >
          <!-- Icon placeholder - replace with actual icons in real implementation -->
          <div class="flex items-center justify-center h-full w-full">
            <span class="text-xs">{{ item.icon.charAt(0).toUpperCase() }}</span>
          </div>
        </div>
        <span>{{ item.name }}</span>
      </div>
    </nav>
    
    <!-- User section -->
    <div class="absolute bottom-0 w-full border-t border-gray-200">
      <div class="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer" @click="navigate('profile')">
        <div class="flex-shrink-0">
          <div class="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-600 font-semibold">
            {{ authStore.user?.name.charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-700">{{ authStore.user?.name }}</p>
          <p class="text-xs font-medium text-gray-500">{{ authStore.user?.role }}</p>
        </div>
      </div>
      
      <div 
        class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
        @click="logout"
      >
        <div class="w-6 h-6 text-gray-400">
          <!-- Logout icon placeholder -->
          <div class="flex items-center justify-center h-full w-full">
            <span class="text-xs">L</span>
          </div>
        </div>
        <span class="ml-3 text-sm font-medium">Logout</span>
      </div>
    </div>
  </aside>
</template>