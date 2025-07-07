<template>
  <div class="bg-white text-gray-900 min-h-screen p-6 sm:p-10">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
     
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left column - Properties Card -->
        <PropertiesCard 
        class="lg:col-span-2" />
        
        <!-- Right top - Calendar Card -->
        <CalendarCard />
        
        <!-- Bottom left - Recent Payments (spans 2 columns) -->
        <RecentPayments class="lg:col-span-2" />
        
        <!-- Space for future components -->
      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
</style>

<script setup lang="ts">
import PropertiesCard from '@/components/landlord/dashboard/PropertiesCard.vue';
import CalendarCard from '@/components/landlord/dashboard/CalendarCard.vue';
import RecentPayments from '@/components/landlord/dashboard/RecentPayments.vue';
</script>
