<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useMotion } from '@vueuse/motion'

const heroRef = ref<HTMLElement | null>(null)
const parallaxOffset = ref(0)

// Vérifier si on est côté client avant d'utiliser useMotion
if (typeof window !== 'undefined') {
  useMotion(heroRef, {
    initial: {
      y: 40,
      opacity: 0,
    },
    enter: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 800,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  })
}

const handleScroll = () => {
  if (typeof window === 'undefined') return
  parallaxOffset.value = window.scrollY * 0.4
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <section 
    id="home" 
    class="relative h-screen-90 flex items-center overflow-hidden"
    ref="heroRef"
  >
    <!-- Background image with parallax effect -->
    <div 
      class="absolute inset-0 w-full h-full bg-cover bg-center"
      :style="{
        backgroundImage: 'url(https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg)',
        transform: `translateY(${parallaxOffset}px)`,
        willChange: 'transform',
        transition: 'transform 0.1s ease-out'
      }"
      role="img"
      aria-label="Beautiful property exterior"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-800/60"></div>
    </div>
    
    <div class="container-custom relative z-10 mt-10">
      <div class="max-w-3xl text-white">
        <h1 
          class="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
        >
          Simplify Your Property Management Journey
        </h1>
        
        <p 
          class="text-lg md:text-xl mt-6 text-white/90 max-w-2xl"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
        >
          Our comprehensive property management platform streamlines operations, enhances tenant satisfaction, and maximizes your investment returns.
        </p>
        
        <div 
          class="mt-10 flex flex-col sm:flex-row gap-4"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }"
        >
          <button class="btn-primary">
            Get Started
          </button>
          <button class="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20">
            Book a Demo
          </button>
        </div>
        
        <div 
          class="mt-16 flex items-center gap-8"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 800 } }"
        >
          <div class="flex -space-x-3">
            <img 
              v-for="i in 4" 
              :key="i"
              :src="`https://i.pravatar.cc/100?img=${i + 10}`" 
              class="w-10 h-10 rounded-full border-2 border-white object-cover"
              :alt="`User avatar ${i}`"
              loading="lazy"
            />
          </div>
          <div class="text-sm">
            <div class="font-semibold">Trusted by 2,000+ property managers</div>
            <div class="text-white/80">Join the community of successful property managers</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Animated scroll indicator -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
      <span class="text-white/80 text-sm mb-2">Scroll to explore</span>
      <div class="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
        <div class="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
      </div>
    </div>
  </section>
</template>
