<template>
  <section class="bg-white rounded-xl shadow-md p-6">
    <div class="flex justify-between items-center text-xs text-gray-500 font-semibold mb-4">
      <button 
        @click="previousMonth"
        class="p-1 hover:bg-gray-100 rounded-full focus:outline-none"
        aria-label="Mois précédent"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" />
      </button>
      
      <div class="flex items-center space-x-2">
        <button 
          @click="showMonthPicker = !showMonthPicker"
          class="bg-blue-100 text-blue-600 rounded-full px-3 py-1 focus:outline-none"
        >
          {{ formattedMonth }}
          <font-awesome-icon :icon="['fas', 'chevron-down']" class="text-xs ml-1" />
        </button>
        
        <button 
          @click="showYearPicker = !showYearPicker"
          class="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {{ currentYear }}
          <font-awesome-icon :icon="['fas', 'chevron-down']" class="text-xs ml-1" />
        </button>
      </div>
      
      <button 
        @click="nextMonth"
        class="p-1 hover:bg-gray-100 rounded-full focus:outline-none"
        aria-label="Mois suivant"
      >
        <font-awesome-icon :icon="['fas', 'chevron-right']" />
      </button>
    </div>
    
    <table class="w-full text-center text-xs text-gray-500 select-none">
      <thead>
        <tr>
          <th v-for="day in weekDays" :key="day" class="py-1 font-semibold">
            {{ day }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex">
          <td 
            v-for="(day, dayIndex) in week" 
            :key="dayIndex"
            class="py-1"
            :class="getDayClasses(day)"
            @click="selectDay(day)"
          >
            {{ day.day }}
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  initialDate: {
    type: Date,
    default: () => new Date()
  }
});

const currentDate = ref(new Date(props.initialDate));
const selectedDate = ref(new Date());
const showMonthPicker = ref(false);
const showYearPicker = ref(false);

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());
const formattedMonth = computed(() => months[currentMonth.value]);

const calendarWeeks = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  
  // Premier jour du mois
  const firstDay = new Date(year, month, 1);
  // Dernier jour du mois
  const lastDay = new Date(year, month + 1, 0);
  
  // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
  const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  
  // Nombre de jours dans le mois
  const daysInMonth = lastDay.getDate();
  
  // Tableau des semaines
  const weeks = [];
  let week = [];
  
  // Ajouter les jours du mois précédent
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month, 0 - (firstDayOfWeek - i - 1));
    week.push({
      day: prevMonthDay.getDate(),
      isCurrentMonth: false,
      date: prevMonthDay
    });
  }
  
  // Ajouter les jours du mois actuel
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    week.push({
      day,
      isCurrentMonth: true,
      date,
    });
    
    // Si on a atteint la fin de la semaine ou la fin du mois
    if (week.length === 7 || day === daysInMonth) {
      // Ajouter les jours du mois suivant si nécessaire
      while (week.length < 7) {
        const nextDay = week[week.length - 1].date.getDate() + 1;
        const nextDate = new Date(year, month, nextDay);
        week.push({
          day: nextDay,
          isCurrentMonth: false,
          date: nextDate
        });
      }
      
      weeks.push([...week]);
      week = [];
    }
  }
  
  return weeks;
});

const getDayClasses = (day) => {
  const isToday = isSameDay(day.date, new Date());
  const isSelected = selectedDate.value && isSameDay(day.date, selectedDate.value);
  
  return {
    'text-gray-300': !day.isCurrentMonth,
    'text-white bg-blue-800 rounded-full': isToday,
    'text-blue-800 font-semibold': isSelected && !isToday,
    'cursor-pointer hover:bg-gray-100': true
  };
};

const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

const selectDay = (day) => {
  selectedDate.value = new Date(day.date);
  // Émettre un événement si nécessaire
  // emit('date-selected', selectedDate.value);
};

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
};

// Exposer des méthodes au besoin
defineExpose({
  getSelectedDate: () => selectedDate.value,
  setDate: (date) => {
    selectedDate.value = new Date(date);
    currentDate.value = new Date(date);
  }
});
</script>
