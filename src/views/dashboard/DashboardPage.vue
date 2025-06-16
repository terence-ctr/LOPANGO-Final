<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePropertiesStore } from '../../stores/properties'

const propertiesStore = usePropertiesStore()

// Sample data for dashboard metrics
const dashboardMetrics = ref({
  totalProperties: 0,
  occupancyRate: 0,
  pendingMaintenance: 0,
  monthlyRevenue: 0
})

// Sample data for recent activities
const recentActivities = ref([
  { id: 1, type: 'payment', description: 'Rent payment received from John Doe', property: 'Sunset Apartments #301', date: '2 hours ago' },
  { id: 2, type: 'maintenance', description: 'New maintenance request: Leaking faucet', property: 'Oakwood Heights #204', date: '5 hours ago' },
  { id: 3, type: 'lease', description: 'Lease signed by new tenant Maria Garcia', property: 'Pine View #102', date: '1 day ago' },
  { id: 4, type: 'property', description: 'New property added: Riverside Condos', property: 'Riverside Condos', date: '2 days ago' }
])

// Computed properties for dashboard cards
const propertyStatusCount = computed(() => {
  return {
    occupied: propertiesStore.properties.filter(p => p.status === 'occupied').length,
    vacant: propertiesStore.properties.filter(p => p.status === 'vacant').length,
    maintenance: propertiesStore.properties.filter(p => p.status === 'maintenance').length,
    listed: propertiesStore.properties.filter(p => p.status === 'listed').length
  }
})

onMounted(async () => {
  await propertiesStore.fetchProperties()
  
  // Update dashboard metrics based on properties data
  dashboardMetrics.value = {
    totalProperties: propertiesStore.properties.length,
    occupancyRate: calculateOccupancyRate(),
    pendingMaintenance: 4, // Mock data
    monthlyRevenue: 24500 // Mock data
  }
})

const calculateOccupancyRate = () => {
  if (propertiesStore.properties.length === 0) return 0
  
  const occupiedCount = propertiesStore.properties.filter(p => p.status === 'occupied').length
  return Math.round((occupiedCount / propertiesStore.properties.length) * 100)
}
</script>

<template>
  <div>
    <!-- Dashboard Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600">Welcome back! Here's an overview of your properties.</p>
    </div>
    
    <!-- Dashboard Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Properties -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary-500">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
            <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Properties</dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">{{ dashboardMetrics.totalProperties }}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      <!-- Occupancy Rate -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-accent-500">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-accent-100 rounded-md p-3">
            <svg class="h-6 w-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Occupancy Rate</dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">{{ dashboardMetrics.occupancyRate }}%</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      <!-- Pending Maintenance -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-warning-500">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-warning-100 rounded-md p-3">
            <svg class="h-6 w-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Pending Maintenance</dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">{{ dashboardMetrics.pendingMaintenance }}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      <!-- Monthly Revenue -->
      <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-success-500">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-success-100 rounded-md p-3">
            <svg class="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">${{ dashboardMetrics.monthlyRevenue.toLocaleString() }}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Properties by Status -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Properties by Status</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-primary-50 rounded-lg p-4">
              <div class="text-3xl font-bold text-primary-700">{{ propertyStatusCount.occupied }}</div>
              <div class="text-sm text-primary-600">Occupied</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-3xl font-bold text-gray-700">{{ propertyStatusCount.vacant }}</div>
              <div class="text-sm text-gray-600">Vacant</div>
            </div>
            <div class="bg-warning-50 rounded-lg p-4">
              <div class="text-3xl font-bold text-warning-700">{{ propertyStatusCount.maintenance }}</div>
              <div class="text-sm text-warning-600">Maintenance</div>
            </div>
            <div class="bg-secondary-50 rounded-lg p-4">
              <div class="text-3xl font-bold text-secondary-700">{{ propertyStatusCount.listed }}</div>
              <div class="text-sm text-secondary-600">Listed</div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <div class="bg-white rounded-lg shadow-sm p-6 h-full">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Upcoming Payments</h2>
          <div class="space-y-4">
            <div class="border-l-4 border-success-500 pl-3 py-2">
              <div class="font-medium">Sunset Apartments #301</div>
              <div class="text-sm text-gray-600">Due: Oct 5, 2025 - $1,450</div>
            </div>
            <div class="border-l-4 border-success-500 pl-3 py-2">
              <div class="font-medium">Pine View #102</div>
              <div class="text-sm text-gray-600">Due: Oct 7, 2025 - $1,200</div>
            </div>
            <div class="border-l-4 border-warning-500 pl-3 py-2">
              <div class="font-medium">Oakwood Heights #204</div>
              <div class="text-sm text-gray-600">Due: Oct 10, 2025 - $1,650</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
      <div class="flow-root">
        <ul class="-mb-8">
          <li v-for="(activity, index) in recentActivities" :key="activity.id">
            <div class="relative pb-8">
              <span v-if="index !== recentActivities.length - 1" class="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              <div class="relative flex items-start space-x-3">
                <!-- Activity icon -->
                <div class="relative">
                  <div 
                    class="h-10 w-10 rounded-full flex items-center justify-center"
                    :class="{
                      'bg-primary-100': activity.type === 'property',
                      'bg-success-100': activity.type === 'payment',
                      'bg-warning-100': activity.type === 'maintenance',
                      'bg-secondary-100': activity.type === 'lease'
                    }"
                  >
                    <span class="text-xs font-bold"
                      :class="{
                        'text-primary-700': activity.type === 'property',
                        'text-success-700': activity.type === 'payment',
                        'text-warning-700': activity.type === 'maintenance',
                        'text-secondary-700': activity.type === 'lease'
                      }"
                    >
                      {{ activity.type.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <!-- Activity content -->
                <div class="min-w-0 flex-1">
                  <div>
                    <p class="text-sm text-gray-900">{{ activity.description }}</p>
                    <div class="mt-1 flex items-center text-xs text-gray-500">
                      <span>{{ activity.property }} • {{ activity.date }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="mt-4 text-center">
        <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">View all activity</a>
      </div>
    </div>
  </div>
</template>