<template>
  <div class="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full flex flex-col items-center">
    <div aria-label="Calendar for April 2021" class="w-full">
      <div class="flex justify-center items-center space-x-2 mb-6 text-xs text-gray-600 font-semibold">
        <button 
          aria-label="Select month" 
          class="flex items-center space-x-1 hover:text-blue-700 focus:outline-none" 
          type="button"
          @click="selectMonth"
        >
          <span>{{ currentMonth }}</span>
          <i class="fas fa-chevron-down text-[10px]"></i>
        </button>
        <button 
          aria-label="Select year" 
          class="flex items-center space-x-1 hover:text-blue-700 focus:outline-none" 
          type="button"
          @click="selectYear"
        >
          <span>{{ currentYear }}</span>
          <i class="fas fa-chevron-down text-[10px]"></i>
        </button>
      </div>
      
      <table class="w-full text-center text-xs text-gray-500 select-none">
        <thead>
          <tr>
            <th v-for="day in days" :key="day" class="py-1 font-semibold">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex">
            <td 
              v-for="(day, dayIndex) in week" 
              :key="dayIndex"
              class="py-1"
              :class="{
                'text-gray-300': !day.isCurrentMonth,
                'text-white bg-blue-700 rounded-full w-6 h-6 mx-auto': day.isToday
              }"
            >
              {{ day.day }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const currentDate = new Date();
const currentMonth = ref('Avril');
const currentYear = ref(2021);

const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const calendarWeeks = computed(() => {
  // This is a simplified version - you might want to implement a proper calendar logic
  return [
    [
      { day: 29, isCurrentMonth: false },
      { day: 30, isCurrentMonth: false },
      { day: 31, isCurrentMonth: false },
      { day: 1, isCurrentMonth: true },
      { day: 2, isCurrentMonth: false },
      { day: 3, isCurrentMonth: false },
      { day: 4, isCurrentMonth: false }
    ],
    [
      { day: 5, isCurrentMonth: true },
      { day: 6, isCurrentMonth: true },
      { day: 7, isCurrentMonth: true },
      { day: 8, isCurrentMonth: true },
      { day: 9, isCurrentMonth: true, isToday: true },
      { day: 10, isCurrentMonth: true },
      { day: 11, isCurrentMonth: true }
    ],
    // Add more weeks as needed
  ];
});

const selectMonth = () => {
  // Implement month selection logic
  console.log('Select month');
};

const selectYear = () => {
  // Implement year selection logic
  console.log('Select year');
};
</script>
