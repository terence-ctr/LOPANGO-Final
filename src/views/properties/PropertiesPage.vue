<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertiesStore } from '../../stores/properties'

const router = useRouter()
const propertiesStore = usePropertiesStore()

// UI states
const isLoading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedType = ref('all')
const showAddPropertyModal = ref(false)

// Filter options
const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'listed', label: 'Listed' }
]

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'commercial', label: 'Commercial' }
]

// Property form
const newProperty = ref({
  title: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  type: 'apartment',
  status: 'vacant',
  price: 0,
  bedrooms: 0,
  bathrooms: 0,
  size: 0,
  year_built: new Date().getFullYear(),
  description: '',
  image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
})

// Computed properties
const filteredProperties = computed(() => {
  return propertiesStore.properties.filter(property => {
    // Apply search filter
    const matchesSearch = 
      property.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Apply status filter
    const matchesStatus = selectedStatus.value === 'all' || property.status === selectedStatus.value;
    
    // Apply type filter
    const matchesType = selectedType.value === 'all' || property.type === selectedType.value;
    
    return matchesSearch && matchesStatus && matchesType;
  });
});

// Methods
const fetchProperties = async () => {
  isLoading.value = true
  try {
    await propertiesStore.fetchProperties()
  } catch (error) {
    console.error('Error fetching properties:', error)
  } finally {
    isLoading.value = false
  }
}

const viewPropertyDetails = (id: number) => {
  router.push({ name: 'property-detail', params: { id } })
}

const submitPropertyForm = async () => {
  try {
    await propertiesStore.createProperty(newProperty.value)
    showAddPropertyModal.value = false
    
    // Reset form
    newProperty.value = {
      title: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      type: 'apartment',
      status: 'vacant',
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      size: 0,
      year_built: new Date().getFullYear(),
      description: '',
      image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    }
    
  } catch (error) {
    console.error('Error creating property:', error)
  }
}

// Get property status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'occupied':
      return 'bg-primary-100 text-primary-800'
    case 'vacant':
      return 'bg-gray-100 text-gray-800'
    case 'maintenance':
      return 'bg-warning-100 text-warning-800'
    case 'listed':
      return 'bg-secondary-100 text-secondary-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  fetchProperties()
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Properties</h1>
        <p class="text-gray-600">Manage your real estate portfolio</p>
      </div>
      <button 
        @click="showAddPropertyModal = true"
        class="btn btn-primary"
      >
        Add Property
      </button>
    </div>
    
    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div>
          <label for="search" class="sr-only">Search</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input 
              id="search" 
              type="text" 
              v-model="searchQuery"
              placeholder="Search properties..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
        
        <!-- Status Filter -->
        <div>
          <label for="status" class="sr-only">Status</label>
          <select 
            id="status" 
            v-model="selectedStatus"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Type Filter -->
        <div>
          <label for="type" class="sr-only">Type</label>
          <select 
            id="type" 
            v-model="selectedType"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option v-for="option in typeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <!-- Properties Grid -->
    <div v-else-if="filteredProperties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="property in filteredProperties" 
        :key="property.id" 
        class="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
      >
        <!-- Property Image -->
        <div class="h-48 w-full overflow-hidden">
          <img 
            :src="property.image_url" 
            :alt="property.title" 
            class="w-full h-full object-cover object-center"
          />
        </div>
        
        <!-- Property Content -->
        <div class="p-4">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-bold text-gray-900 mb-1">{{ property.title }}</h3>
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="getStatusColor(property.status)"
            >
              {{ property.status.charAt(0).toUpperCase() + property.status.slice(1) }}
            </span>
          </div>
          
          <p class="text-sm text-gray-600 mb-2">{{ property.address }}, {{ property.city }}</p>
          
          <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div>{{ property.bedrooms }} bd</div>
            <div>{{ property.bathrooms }} ba</div>
            <div>{{ property.size.toLocaleString() }} sqft</div>
            <div>${{ property.price.toLocaleString() }}</div>
          </div>
          
          <button 
            @click="viewPropertyDetails(property.id)" 
            class="w-full btn btn-outline"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900">No properties found</h3>
      <p class="mt-1 text-sm text-gray-500">
        Get started by creating a new property or try a different search.
      </p>
      <div class="mt-6">
        <button 
          @click="showAddPropertyModal = true"
          class="btn btn-primary"
        >
          Add Property
        </button>
      </div>
    </div>
    
    <!-- Add Property Modal -->
    <div v-if="showAddPropertyModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity" @click="showAddPropertyModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="submitPropertyForm">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="mb-4">
                <h3 class="text-lg font-medium text-gray-900">Add New Property</h3>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                  <input 
                    type="text" 
                    id="title" 
                    v-model="newProperty.title" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div class="col-span-2">
                  <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
                  <input 
                    type="text" 
                    id="address" 
                    v-model="newProperty.address" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div class="col-span-1">
                  <label for="city" class="block text-sm font-medium text-gray-700">City</label>
                  <input 
                    type="text" 
                    id="city" 
                    v-model="newProperty.city" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div class="col-span-1">
                  <label for="state" class="block text-sm font-medium text-gray-700">State</label>
                  <input 
                    type="text" 
                    id="state" 
                    v-model="newProperty.state" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div class="col-span-1">
                  <label for="type" class="block text-sm font-medium text-gray-700">Property Type</label>
                  <select 
                    id="type" 
                    v-model="newProperty.type"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                
                <div class="col-span-1">
                  <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                  <select 
                    id="status" 
                    v-model="newProperty.status"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="listed">Listed</option>
                  </select>
                </div>
                
                <div class="col-span-1">
                  <label for="price" class="block text-sm font-medium text-gray-700">Price ($)</label>
                  <input 
                    type="number" 
                    id="price" 
                    v-model="newProperty.price" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div class="col-span-1">
                  <label for="size" class="block text-sm font-medium text-gray-700">Size (sqft)</label>
                  <input 
                    type="number" 
                    id="size" 
                    v-model="newProperty.size" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div class="col-span-1">
                  <label for="bedrooms" class="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <input 
                    type="number" 
                    id="bedrooms" 
                    v-model="newProperty.bedrooms" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div class="col-span-1">
                  <label for="bathrooms" class="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <input 
                    type="number" 
                    id="bathrooms" 
                    v-model="newProperty.bathrooms" 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div class="col-span-2">
                  <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea 
                    id="description" 
                    v-model="newProperty.description" 
                    rows="3"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="submit"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Add Property
              </button>
              <button 
                type="button"
                @click="showAddPropertyModal = false"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>