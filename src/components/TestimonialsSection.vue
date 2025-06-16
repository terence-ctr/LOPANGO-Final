<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const testimonials = [
  {
    id: 1,
    quote: "EstateManage transformed how we operate our 50-unit apartment complex. We've seen a 30% reduction in operational costs and tenant satisfaction is at an all-time high.",
    name: "Sarah Johnson",
    title: "Property Manager, Skyline Properties",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
  },
  {
    id: 2,
    quote: "The financial reporting tools alone saved us countless hours each month. Now we can make data-driven decisions that have increased our portfolio's value by 18% in just one year.",
    name: "Michael Chen",
    title: "Real Estate Investor, Urban Ventures",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
  },
  {
    id: 3,
    quote: "Maintenance requests that used to take days to process are now handled in hours. Our tenants are happier, and we've seen a remarkable decrease in turnover rates.",
    name: "Rebecca Torres",
    title: "Operations Director, Coastal Residences",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
  }
]

const currentTestimonial = ref(0)
const testimonialsRef = ref<HTMLElement | null>(null)

const nextTestimonial = () => {
  if (!testimonialsRef.value) return
  
  const next = (currentTestimonial.value + 1) % testimonials.length
  animateTransition(next)
}

const prevTestimonial = () => {
  if (!testimonialsRef.value) return
  
  const prev = (currentTestimonial.value - 1 + testimonials.length) % testimonials.length
  animateTransition(prev)
}

const setTestimonial = (index: number) => {
  if (!testimonialsRef.value) return
  
  animateTransition(index)
}

const animateTransition = (newIndex: number) => {
  if (!testimonialsRef.value) return
  
  // Vérifier si l'élément existe avant d'animer
  const targetElement = testimonialsRef.value.querySelector('.testimonial-content')
  if (!targetElement) return
  
  gsap.to(targetElement, {
    opacity: 0,
    y: 20,
    duration: 0.3,
    onComplete: () => {
      currentTestimonial.value = newIndex
      // Utiliser nextTick pour s'assurer que le DOM est mis à jour avant l'animation
      setTimeout(() => {
        gsap.to(targetElement, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out'
        })
      }, 50)
    }
  })
}

onMounted(() => {
  // Auto-rotate testimonials
  const interval = setInterval(() => {
    nextTestimonial()
  }, 8000)

  return () => clearInterval(interval)
})
</script>

<template>
  <section id="testimonials" class="py-24 bg-primary-800 text-white relative overflow-hidden">
    <!-- Decorative elements -->
    <div class="absolute top-0 left-0 w-64 h-64 bg-primary-700 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-primary-700 rounded-full opacity-20 translate-x-1/3 translate-y-1/3"></div>
    
    <div class="container-custom relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 
          class="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-white leading-tight"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
        >
          What Our Clients Say
        </h2>
        <p 
          class="text-lg text-white/80 mt-4 max-w-2xl mx-auto"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 200 } }"
        >
          Discover how our property management solutions have helped property owners and managers streamline operations and increase profitability.
        </p>
      </div>
      
      <div 
        ref="testimonialsRef"
        class="max-w-4xl mx-auto"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0, transition: { delay: 400 } }"
      >
        <div 
          ref="testimonialsRef"
          class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12"
        >
          <div class="text-2xl md:text-3xl font-display italic text-white leading-relaxed mb-8">
            "{{ testimonials[currentTestimonial].quote }}"
          </div>
          
          <div class="flex items-center">
            <img 
              :src="testimonials[currentTestimonial].image" 
              :alt="testimonials[currentTestimonial].name"
              class="w-16 h-16 rounded-full object-cover mr-5"
            />
            <div>
              <div class="font-semibold text-xl">{{ testimonials[currentTestimonial].name }}</div>
              <div class="text-white/80">{{ testimonials[currentTestimonial].title }}</div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-center mt-10">
          <div class="flex items-center space-x-4">
            <button 
              @click="prevTestimonial"
              class="p-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div class="flex space-x-2">
              <button 
                v-for="(_, index) in testimonials" 
                :key="index"
                @click="setTestimonial(index)"
                class="w-3 h-3 rounded-full transition-all duration-300"
                :class="index === currentTestimonial ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'"
              ></button>
            </div>
            
            <button 
              @click="nextTestimonial"
              class="p-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>