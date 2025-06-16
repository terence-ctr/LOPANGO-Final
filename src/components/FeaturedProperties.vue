<script setup lang="ts">
import { ref } from 'vue'
import { Swiper as SwiperClass } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Navigation, Autoplay } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

// Types
type Property = {
  id: number
  title: string
  location: string
  description: string
  image: string
  units: number
  occupancy: string
  revenue: string
}

defineProps<{
  properties: Property[]
  customClass?: string
}>()

// Référence à l'instance Swiper
const swiperInstance = ref<SwiperClass | null>(null)

// Configuration des modules Swiper
const modules = [Pagination, Navigation, Autoplay]

// Gestion des événements Swiper
const onSwiper = (swiper: SwiperClass) => {
  swiperInstance.value = swiper
}

const onSlideChange = () => {
  console.log('Slide change')
}

// Navigation functions
const nextSlide = () => {
  if (swiperInstance.value) {
    swiperInstance.value.slideNext()
  }
}

const prevSlide = () => {
  if (swiperInstance.value) {
    swiperInstance.value.slidePrev()
  }
}
</script>

<template>
  <section :class="['featured-properties', customClass]">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
        <div class="max-w-2xl mb-6 md:mb-0">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Propriétés en Vedette
          </h2>
          <p class="text-gray-600">
            Découvrez nos propriétés les plus populaires et disponibles
          </p>
        </div>

        <div class="flex space-x-4">
          <button 
            @click="prevSlide"
            class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Précédent"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            @click="nextSlide"
            class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Suivant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div class="relative">
        <swiper
          :modules="modules"
          :pagination="{ clickable: true }"
          :navigation="{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }"
          :autoplay="{
            delay: 5000,
            disableOnInteraction: false,
          }"
          :breakpoints="{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }"
          :space-between="30"
          :loop="true"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
          class="pb-12"
        >
          <swiper-slide v-for="property in properties" :key="property.id">
            <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              <div class="relative h-48 overflow-hidden">
                <img 
                  :src="property.image" 
                  :alt="property.title"
                  class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div class="absolute top-4 right-4 bg-white/90 text-primary-600 text-sm font-semibold px-3 py-1 rounded-full">
                  {{ property.occupancy }} Occupé
                </div>
              </div>
              
              <div class="p-6 flex-grow flex flex-col">
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ property.title }}</h3>
                <p class="text-gray-600 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ property.location }}
                </p>
                <p class="text-gray-600 text-sm mb-4 flex-grow">
                  {{ property.description }}
                </p>
                
                <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-primary-600">{{ property.units }}</p>
                    <p class="text-xs text-gray-500">Unités</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-primary-600">{{ property.revenue }}</p>
                    <p class="text-xs text-gray-500">Revenu mensuel</p>
                  </div>
                </div>
              </div>
              
              <div class="px-6 pb-6">
                <button class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Voir les détails
                </button>
              </div>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>
  </section>
</template>

<style scoped>
.featured-properties {
  @apply py-16 bg-gray-50;
}

:deep(.swiper-pagination-bullet) {
  @apply w-3 h-3 bg-gray-300 opacity-100;
}

:deep(.swiper-pagination-bullet-active) {
  @apply bg-primary-600;
}

:deep(.swiper-button-disabled) {
  @apply opacity-30 cursor-not-allowed;
}
</style>