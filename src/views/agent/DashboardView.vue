<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-900">
    <!-- Main content -->
    <main class="flex-1 p-6 md:p-10 max-w-full overflow-x-auto">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-lg font-bold mb-1 select-none">
          Tableau de bord
        </h1>
        <p class="text-xs text-gray-700 mb-6 select-none">
          Heureux de vous revoir Mr Lokenye Jeffr !
        </p>
        <!-- Stats cards -->
        <div class="flex flex-wrap gap-4 mb-8">
          <div class="flex items-center space-x-3 border border-gray-300 rounded-lg px-5 py-4 min-w-[140px] max-w-[180px]">
            <div class="bg-[#1E4DB7] p-2 rounded-full text-white">
              <i class="fas fa-file-alt text-sm">
              </i>
            </div>
            <div>
              <p class="text-lg font-bold leading-none select-none">
                35K
              </p>
              <p class="text-xs text-gray-600 select-none">
                Nombre total des propriétés
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3 border border-gray-300 rounded-lg px-5 py-4 min-w-[140px] max-w-[180px]">
            <div class="bg-[#1E4DB7] p-2 rounded-full text-white">
              <i class="fas fa-file-alt text-sm">
              </i>
            </div>
            <div>
              <p class="text-lg font-bold leading-none select-none">
                5K
              </p>
              <p class="text-xs text-gray-600 select-none">
                Nombre total des Bailleurs
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3 border border-gray-300 rounded-lg px-5 py-4 min-w-[140px] max-w-[180px]">">
            <div class="bg-[#1E4DB7] p-2 rounded-full text-white">
              <i class="fas fa-file-alt text-sm">
              </i>
            </div>
            <div>
              <p class="text-lg font-bold leading-none select-none">
                1,2K
              </p>
              <p class="text-xs text-gray-600 select-none">
                Nombre total des commissionnaires
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3 border border-gray-300 rounded-lg px-5 py-4 min-w-[140px] max-w-[180px]">">
            <div class="bg-[#1E4DB7] p-2 rounded-full text-white">
              <i class="fas fa-file-alt text-sm">
              </i>
            </div>
            <div>
              <p class="text-lg font-bold leading-none select-none">
                869
              </p>
              <p class="text-xs text-gray-600 select-none">
                Plaintes en cours
              </p>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Left side: Recent transactions -->
          <section class="flex-1 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 class="font-semibold text-base mb-4 select-none">
              Les transactions récentes
            </h2>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-gray-700 border-collapse border border-gray-200 rounded-lg">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="py-2 px-3 border-r border-gray-200 w-8 font-semibold select-none">#</th>
                    <th class="py-2 px-3 border-r border-gray-200 font-semibold select-none">Propriété</th>
                    <th class="py-2 px-3 border-r border-gray-200 font-semibold select-none">Montant</th>
                    <th class="py-2 px-3 border-r border-gray-200 font-semibold select-none">A utilisé sa garantie ?</th>
                    <th class="py-2 px-3 font-semibold select-none">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(transaction, index) in transactions" :key="index" class="border-b border-gray-200">
                    <td class="py-2 px-3 border-r border-gray-200 font-semibold select-none">{{ index + 1 }}</td>
                    <td class="py-2 px-3 border-r border-gray-200 select-none">{{ transaction.property }}</td>
                    <td class="py-2 px-3 border-r border-gray-200 select-none">{{ transaction.amount }}</td>
                    <td class="py-2 px-3 border-r border-gray-200 select-none">{{ transaction.warrantyUsed ? 'Oui' : 'Non' }}</td>
                    <td class="py-2 px-3 select-none">{{ transaction.date }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          
          <!-- Right side: Calendar and Alerts -->
          <aside class="w-full lg:w-80 flex flex-col gap-6">
            <!-- Calendar -->
            <section class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm select-none">
              <div class="flex justify-between items-center mb-4 text-xs text-gray-600 font-semibold">
                <div>Avril</div>
                <div>2021</div>
              </div>
              <div class="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-semibold mb-2">
                <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
              </div>
              <div class="grid grid-cols-7 gap-1 text-center text-xs text-gray-700">
                <div v-for="(day, dayIndex) in calendarDays" :key="dayIndex" :class="{'text-gray-300': !day.currentMonth, 'bg-[#1E4DB7] text-white rounded-full w-6 h-6 mx-auto flex items-center justify-center': day.today}">
                  {{ day.day }}
                </div>
              </div>
            </section>
            
            <!-- Alerts -->
            <section class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 class="font-semibold text-sm mb-4 select-none">Alertes</h3>
              <div class="space-y-3 text-xs">
                <div v-for="(alert, index) in alerts" :key="index" :class="`flex items-start space-x-2 ${alert.type === 'error' ? 'bg-red-100 border-red-300 text-red-600' : 'bg-yellow-100 border-yellow-300 text-yellow-700'} border rounded p-2`">
                  <i class="fas fa-exclamation-triangle mt-0.5"></i>
                  <p><span class="font-semibold">{{ alert.user }}</span> {{ alert.message }}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
    
    <!-- Top right icons (bell and avatar) -->
    <div class="fixed top-6 right-6 flex flex-col items-center space-y-4 z-20">
      <button aria-label="Notifications" class="text-gray-600 hover:text-gray-900 focus:outline-none">
        <i class="far fa-bell text-lg"></i>
      </button>
      <img alt="Avatar" class="w-8 h-8 rounded-full object-cover" src="https://storage.googleapis.com/a1aa/image/112448e1-2c54-4e66-0733-892b4ae06d6e.jpg"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Données de test pour les transactions
const transactions = ref([
  { property: 'Appartement B20', amount: '450$', warrantyUsed: false, date: '30/03/2024' },
  { property: 'Appartement B20', amount: '450$', warrantyUsed: false, date: '30/02/2024' },
  { property: 'Appartement B20', amount: '450$', warrantyUsed: true, date: '30/01/2024' },
  { property: 'Appartement B20', amount: '450$', warrantyUsed: false, date: '30/12/2023' },
  { property: 'Appartement B20', amount: '450$', warrantyUsed: false, date: '30/11/2023' },
]);

// Données pour le calendrier
const calendarDays = ref([
  { day: 29, currentMonth: false, today: false },
  { day: 30, currentMonth: false, today: false },
  { day: 31, currentMonth: false, today: false },
  { day: 1, currentMonth: true, today: true },
  { day: 2, currentMonth: true, today: false },
  // ... autres jours du mois
]);

// Données pour les alertes
const alerts = ref([
  { 
    user: 'Marcel Senga', 
    message: 'a dépassé son ultimatum de loyer.',
    type: 'error'
  },
  { 
    user: 'Marcel Senga',
    message: 'est très proche de son ultimatum de loyer',
    type: 'warning'
  },
  { 
    user: 'Jason Isamene',
    message: 'est très proche de son ultimatum de loyer',
    type: 'warning'
  },
  { 
    user: 'Elie Ono',
    message: 'est très proche de son ultimatum de loyer',
    type: 'warning'
  }
]);
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
