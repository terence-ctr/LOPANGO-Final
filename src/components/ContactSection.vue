<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  name: '',
  email: '',
  phone: '',
  propertyType: '',
  message: ''
})

const errors = ref({})
const isSubmitting = ref(false)
const formSubmitted = ref(false)

const propertyTypes = [
  'Residential Apartments',
  'Commercial Properties',
  'Single-Family Homes',
  'Multi-Family Units',
  'Condominiums',
  'Vacation Rentals',
  'Other'
]

const validateForm = () => {
  const newErrors = {}
  
  if (!formData.value.name.trim()) {
    newErrors.name = 'Name is required'
  }
  
  if (!formData.value.email.trim()) {
    newErrors.email = 'Email is required'
  } else if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
    newErrors.email = 'Please enter a valid email'
  }
  
  if (!formData.value.propertyType) {
    newErrors.propertyType = 'Please select a property type'
  }
  
  if (!formData.value.message.trim()) {
    newErrors.message = 'Message is required'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const submitForm = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  isSubmitting.value = false
  formSubmitted.value = true
  
  // Reset form
  formData.value = {
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    message: ''
  }
}
</script>

<template>
  <section id="contact" class="py-24 bg-neutral-50">
    <div class="container-custom">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div 
            class="lg:pr-10"
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :visible="{ opacity: 1, x: 0 }"
          >
            <h2 class="section-title">Get in Touch</h2>
            <p class="section-subtitle">
              Ready to revolutionize your property management approach? Contact us today to learn how our platform can help you streamline operations and maximize returns.
            </p>
            
            <div class="mt-10 space-y-6">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-primary-800">Phone</h3>
                  <p class="mt-1 text-neutral-600">+1 (555) 123-4567</p>
                  <p class="text-neutral-500 text-sm">Mon-Fri from 8am to 6pm</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-primary-800">Email</h3>
                  <p class="mt-1 text-neutral-600">info@estatemanage.com</p>
                  <p class="text-neutral-500 text-sm">We'll respond as soon as possible</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-primary-800">Office</h3>
                  <p class="mt-1 text-neutral-600">123 Property Lane, Suite 400</p>
                  <p class="text-neutral-500 text-sm">New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            v-motion
            :initial="{ opacity: 0, x: 20 }"
            :visible="{ opacity: 1, x: 0, transition: { delay: 200 } }"
          >
            <div class="bg-white shadow-elegant rounded-xl p-8">
              <h3 class="text-2xl font-display font-semibold text-primary-800 mb-6">Send us a message</h3>
              
              <div v-if="formSubmitted" class="bg-teal-50 border-l-4 border-teal-500 p-4 rounded mb-6">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-teal-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-teal-700">
                      Thank you for your message! We'll get back to you shortly.
                    </p>
                  </div>
                </div>
              </div>
              
              <form @submit.prevent="submitForm" class="space-y-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-neutral-700">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    v-model="formData.name"
                    class="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                    :class="{'border-red-300': errors.name}"
                  />
                  <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="email" class="block text-sm font-medium text-neutral-700">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      v-model="formData.email"
                      class="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                      :class="{'border-red-300': errors.email}"
                    />
                    <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
                  </div>
                  
                  <div>
                    <label for="phone" class="block text-sm font-medium text-neutral-700">Phone (Optional)</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      v-model="formData.phone"
                      class="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                    />
                  </div>
                </div>
                
                <div>
                  <label for="propertyType" class="block text-sm font-medium text-neutral-700">Property Type</label>
                  <select 
                    id="propertyType" 
                    v-model="formData.propertyType"
                    class="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                    :class="{'border-red-300': errors.propertyType}"
                  >
                    <option value="">Select a property type</option>
                    <option v-for="type in propertyTypes" :key="type" :value="type">{{ type }}</option>
                  </select>
                  <p v-if="errors.propertyType" class="mt-1 text-sm text-red-600">{{ errors.propertyType }}</p>
                </div>
                
                <div>
                  <label for="message" class="block text-sm font-medium text-neutral-700">Message</label>
                  <textarea 
                    id="message" 
                    v-model="formData.message"
                    rows="4" 
                    class="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-20"
                    :class="{'border-red-300': errors.message}"
                  ></textarea>
                  <p v-if="errors.message" class="mt-1 text-sm text-red-600">{{ errors.message }}</p>
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    class="w-full btn-primary flex items-center justify-center"
                    :disabled="isSubmitting"
                  >
                    <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isSubmitting ? 'Sending...' : 'Send Message' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>