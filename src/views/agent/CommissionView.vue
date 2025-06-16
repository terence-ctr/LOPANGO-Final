<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Suivi des commissions</h1>
      <div class="flex space-x-3">
        <select class="border rounded-md px-3 py-2 text-sm">
          <option>Ce mois-ci</option>
          <option>Le mois dernier</option>
          <option>Ce trimestre</option>
          <option>Cette année</option>
          <option>Toutes les périodes</option>
        </select>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
          Exporter
        </button>
      </div>
    </div>
    
    <!-- Cartes de résumé -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Commission totale</h3>
        <p class="text-2xl font-bold">12 450 €</p>
        <p class="text-sm text-green-600 mt-1">+15% vs période précédente</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Transactions</h3>
        <p class="text-2xl font-bold">8</p>
        <p class="text-sm text-green-600 mt-1">+2 vs période précédente</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Commission moyenne</h3>
        <p class="text-2xl font-bold">1 556 €</p>
        <p class="text-sm text-green-600 mt-1">+5% vs période précédente</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Objectif</h3>
        <p class="text-2xl font-bold">75%</p>
        <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div class="bg-blue-600 h-2.5 rounded-full" style="width: 75%"></div>
        </div>
      </div>
    </div>
    
    <!-- Graphique et tableau -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Graphique -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium mb-4">Évolution des commissions</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p class="text-gray-500">Graphique des commissions (à implémenter)</p>
        </div>
      </div>
      
      <!-- Top transactions -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium mb-4">Top transactions</h3>
        <div class="space-y-4">
          <div v-for="i in 3" :key="i" class="border-b pb-3 last:border-0 last:pb-0">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium">Appartement T3</p>
                <p class="text-sm text-gray-500">Paris 15ème</p>
              </div>
              <span class="font-medium">3 250 €</span>
            </div>
            <div class="flex justify-between text-sm text-gray-500 mt-1">
              <span>Vente</span>
              <span>15/05/2023</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Liste des transactions -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">Historique des transactions</h3>
          <div class="flex space-x-2">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              class="px-3 py-1 border rounded-md text-sm w-64"
            >
            <select class="border rounded-md px-3 py-1 text-sm">
              <option>Tous les types</option>
              <option>Vente</option>
              <option>Location</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commission
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
            <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ transaction.property }}</div>
                <div class="text-sm text-gray-500">{{ transaction.reference }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[transaction.type === 'Vente' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full']">
                  {{ transaction.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ transaction.date }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ transaction.amount }} €
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {{ transaction.commission }} €
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[transaction.status === 'Payée' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full']">
                  {{ transaction.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" class="text-blue-600 hover:text-blue-900">Voir</a>
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
              Affichage de <span class="font-medium">1</span> à <span class="font-medium">5</span> sur <span class="font-medium">24</span> résultats
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
const transactions = [
  {
    id: 1,
    property: 'Appartement T3',
    reference: 'REF-2023-001',
    type: 'Vente',
    date: '15/05/2023',
    amount: '450 000',
    commission: '13 500',
    status: 'Payée'
  },
  {
    id: 2,
    property: 'Maison avec jardin',
    reference: 'REF-2023-002',
    type: 'Location',
    date: '10/05/2023',
    amount: '1 800',
    commission: '1 800',
    status: 'En attente'
  },
  {
    id: 3,
    property: 'Appartement T2',
    reference: 'REF-2023-003',
    type: 'Vente',
    date: '05/05/2023',
    amount: '320 000',
    commission: '9 600',
    status: 'Payée'
  },
  {
    id: 4,
    property: 'Villa avec piscine',
    reference: 'REF-2023-004',
    type: 'Vente',
    date: '28/04/2023',
    amount: '750 000',
    commission: '22 500',
    status: 'Payée'
  },
  {
    id: 5,
    property: 'Studio centre-ville',
    reference: 'REF-2023-005',
    type: 'Location',
    date: '20/04/2023',
    amount: '1 200',
    commission: '1 200',
    status: 'Payée'
  }
];
</script>
