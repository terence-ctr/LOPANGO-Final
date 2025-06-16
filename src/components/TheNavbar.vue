<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const scrolled = ref(false)
const mobileMenuOpen = ref(false)

const updateScrollState = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', updateScrollState)
  updateScrollState()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollState)
})

const navbarClasses = computed(() => {
  return scrolled.value 
    ? 'bg-white shadow-md py-3' 
    : 'bg-transparent py-5'
})

const logoTextColor = computed(() => {
  return scrolled.value ? 'text-primary-800' : 'text-white'
})

const navLinkColor = computed(() => {
  return scrolled.value ? 'text-primary-700 hover:text-primary-900' : 'text-white/90 hover:text-white'
})

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-apple"
    :class="navbarClasses"
  >
    <div class="container-custom">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <a href="#" class="flex items-center">
          <span class="font-display text-2xl font-bold transition-colors duration-300" :class="logoTextColor">
            EstateManage
          </span>
        </a>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <a 
            v-for="(item, index) in ['Home', 'Services', 'Properties', 'Testimonials', 'Contact']" 
            :key="index"
            :href="`#${item.toLowerCase()}`"
            class="font-medium transition-colors duration-300"
            :class="navLinkColor"
          >
            {{ item }}
          </a>
          
          <button class="btn-primary">
            Get Started
          </button>
        </nav>
        
        <!-- Mobile menu button -->
      
      </div>
      
      <!-- Mobile Navigation -->
      <div
        v-show="mobileMenuOpen"
        class="md:hidden"
      >
        <div class="px-2 pt-2 pb-3 space-y-1 mt-3">
          <a 
            v-for="(item, index) in ['Home', 'Services', 'Properties', 'Testimonials', 'Contact']" 
            :key="index"
            :href="`#${item.toLowerCase()}`"
            class="block px-3 py-2 rounded-md text-base font-medium"
            :class="scrolled ? 'text-primary-700 hover:bg-primary-50' : 'text-white hover:bg-white/10'"
            @click="mobileMenuOpen = false"
          >
            {{ item }}
          </a>
          
          <button class="btn-primary w-full mt-4">
            Get Started
          </button>
        </div>
      </div>
    </div>
  </header>
</template>