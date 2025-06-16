<script setup lang="ts">
import { ref } from 'vue'

const services = [
  {
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    title: 'Property Listing',
    description: 'Showcase your properties with stunning visuals and detailed information to attract potential tenants and buyers.'
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    title: 'Tenant Management',
    description: 'Streamline tenant applications, screening, and communication all in one centralized platform.'
  },
  {
    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z',
    title: 'Rent Collection',
    description: 'Automate rent collection, track payments, and manage financial transactions with ease.'
  },
  {
    icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    title: 'Maintenance Requests',
    description: 'Handle maintenance requests efficiently with our digital ticketing system and vendor management tools.'
  },
  {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    title: 'Financial Reporting',
    description: 'Access comprehensive financial reports and analytics to make data-driven decisions for your properties.'
  },
  {
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    title: 'Calendar & Scheduling',
    description: 'Organize property viewings, inspections, and maintenance visits with our intuitive scheduling system.'
  }
]
</script>

<template>
  <section id="services" class="py-24 bg-neutral-50">
    <div class="container-custom">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 
          class="section-title"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 200 } }"
        >
          Comprehensive Property Management Solutions
        </h2>
        <p 
          class="section-subtitle mx-auto"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 400 } }"
        >
          Our platform offers a complete suite of tools designed to streamline your property management operations and maximize efficiency.
        </p>
      </div>
      
      <div 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0 }"
      >
        <div 
          v-for="(service, index) in services" 
          :key="index"
          class="card group p-6 hover:bg-primary-800 hover:text-white transition-all duration-500"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 200 + (index * 100) } }"
        >
          <div class="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-6 group-hover:bg-white/20 group-hover:text-white transition-all duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="service.icon" />
            </svg>
          </div>
          
          <h3 class="text-xl font-display font-semibold mb-3 text-primary-800 group-hover:text-white transition-colors duration-500">
            {{ service.title }}
          </h3>
          
          <p class="text-neutral-600 group-hover:text-white/90 transition-colors duration-500">
            {{ service.description }}
          </p>
          
          <div class="mt-6 flex items-center text-primary-600 group-hover:text-white/90 transition-colors duration-500">
            <span class="font-medium">Learn more</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>