<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestion des rendez-vous</h1>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Nouveau RDV
      </button>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Calendrier -->
      <div class="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium">Calendrier</h2>
            <div class="flex space-x-2">
              <select class="border rounded-md px-3 py-1 text-sm">
                <option>Mois</option>
                <option>Semaine</option>
                <option>Jour</option>
              </select>
              <button class="p-1 border rounded-md hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="p-4">
          <!-- Espace pour le calendrier -->
          <div class="h-96 bg-gray-50 rounded-md flex items-center justify-center">
            <p class="text-gray-500">Calendrier des rendez-vous (à implémenter)</p>
          </div>
        </div>
      </div>
      
      <!-- Liste des rendez-vous du jour -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-medium">Aujourd'hui</h2>
          <p class="text-sm text-gray-500">{{ new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
        </div>
        <div class="p-4 space-y-4">
          <!-- RDV du jour -->
          <div v-for="(appointment, index) in todaysAppointments" :key="index" 
               class="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium">{{ appointment.client }}</p>
                <p class="text-sm text-gray-600">{{ appointment.type }}</p>
              </div>
              <span class="text-sm font-medium">{{ appointment.time }}</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">{{ appointment.address }}</p>
          </div>
          
          <!-- Aucun RDV -->
          <div v-if="todaysAppointments.length === 0" class="text-center py-4">
            <p class="text-gray-500">Aucun rendez-vous prévu</p>
          </div>
          
          <!-- Bouton d'ajout rapide -->
          <button class="w-full mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
            + Ajouter un rendez-vous
          </button>
        </div>
      </div>
    </div>
    
    <!-- Liste des prochains rendez-vous -->
    <div class="mt-8 bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium">Prochains rendez-vous</h2>
          <div class="flex space-x-2">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              class="px-3 py-1 border rounded-md text-sm w-64"
            >
            <select class="border rounded-md px-3 py-1 text-sm">
              <option>Tous les statuts</option>
              <option>Confirmé</option>
              <option>En attente</option>
              <option>Annulé</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Heure
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lieu
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="appointment in upcomingAppointments" :key="appointment.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatDate(appointment.date) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ appointment.time }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-blue-600 font-medium">{{ getInitials(appointment.client) }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ appointment.client }}</div>
                    <div class="text-sm text-gray-500">{{ appointment.phone }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ appointment.type }}</div>
                <div class="text-sm text-gray-500">{{ appointment.property }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ appointment.address }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[getStatusClass(appointment.status), 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full']">
                  {{ appointment.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-3">
                  <button class="text-blue-600 hover:text-blue-900">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button class="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-.867.504 1 1 0 11-1.731-1A3 3 0 019 7.5V10a1 1 0 01-2 0v-.5a1 1 0 00-1-1H5a1 1 0 010-2h1a1 1 0 00.976-.78 1 1 0 011.98.28A3 3 0 0011 6.5V10a1 1 0 11-2 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button class="text-red-600 hover:text-red-900">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="flex-1 flex justify-between sm:hidden">
          <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Précédent
          </a>
          <a href="#" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Suivant
          </a>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Affichage de <span class="font-medium">1</span> à <span class="font-medium">5</span> sur <span class="font-medium">12</span> résultats
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">Précédent</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </a>
              <a href="#" aria-current="page" class="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                1
              </a>
              <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                2
              </a>
              <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                3
              </a>
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
              <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                8
              </a>
              <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">Suivant</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Données de démonstration
const todaysAppointments = [
  {
    id: 1,
    client: 'Jean Dupont',
    type: 'Visite',
    time: '14:30 - 15:00',
    address: '12 Rue de la Paix, 75002 Paris',
    status: 'Confirmé'
  },
  {
    id: 2,
    client: 'Marie Martin',
    type: 'Signature',
    time: '16:15 - 16:45',
    address: 'Bureau',
    status: 'Confirmé'
  }
];

const upcomingAppointments = [
  {
    id: 1,
    date: '2023-06-15',
    time: '10:00 - 10:30',
    client: 'Sophie Dubois',
    phone: '06 12 34 56 78',
    type: 'Visite',
    property: 'Appartement T3 - Paris 15',
    address: '25 Avenue des Champs-Élysées, 75008 Paris',
    status: 'Confirmé'
  },
  {
    id: 2,
    date: '2023-06-15',
    time: '11:30 - 12:30',
    client: 'Thomas Leroy',
    phone: '06 98 76 54 32',
    type: 'Estimation',
    property: 'Maison - Versailles',
    address: '18 Rue de la Reine, 78000 Versailles',
    status: 'Confirmé'
  },
  {
    id: 3,
    date: '2023-06-16',
    time: '09:15 - 10:00',
    client: 'Nathalie Petit',
    phone: '06 45 67 89 01',
    type: 'Visite',
    property: 'Appartement T2 - Paris 5',
    address: '12 Rue Mouffetard, 75005 Paris',
    status: 'En attente'
  },
  {
    id: 4,
    date: '2023-06-17',
    time: '14:00 - 15:30',
    client: 'Marc Lambert',
    phone: '06 23 45 67 89',
    type: 'Signature',
    property: 'Bureau',
    address: 'Agence immobilière, 35 Avenue de l\'Opéra, 75001 Paris',
    status: 'Confirmé'
  },
  {
    id: 5,
    date: '2023-06-18',
    time: '16:00 - 17:00',
    client: 'Élodie Moreau',
    phone: '06 78 90 12 34',
    type: 'Visite',
    property: 'Loft - Montmartre',
    address: '7 Rue Lepic, 75018 Paris',
    status: 'Confirmé'
  }
];

// Fonctions utilitaires
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Confirmé':
      return 'bg-green-100 text-green-800';
    case 'En attente':
      return 'bg-yellow-100 text-yellow-800';
    case 'Annulé':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
</script>
