<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Mes paiements</h1>
      <p class="text-gray-500 mt-1">Gérez vos paiements de loyer et consultez votre historique</p>
    </div>
    
    <!-- Résumé des paiements -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-gray-500 text-sm">Dernier paiement</p>
            <p class="text-lg font-semibold">1 200,00 €</p>
            <p class="text-sm text-gray-500">05/05/2023</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-gray-500 text-sm">Prochain paiement</p>
            <p class="text-lg font-semibold">1 200,00 €</p>
            <p class="text-sm text-gray-500">05/06/2023</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-gray-500 text-sm">Historique</p>
            <p class="text-lg font-semibold">5 paiements</p>
            <p class="text-sm text-gray-500">Total: 6 000,00 €</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Derniers paiements -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Historique des paiements
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Liste de tous vos paiements effectués
            </p>
          </div>
          <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Exporter en PDF
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ payment.date }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ payment.reference }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ payment.period }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ payment.amount }} €
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[payment.status === 'Payé' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full']">
                  {{ payment.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" class="text-blue-600 hover:text-blue-900 mr-3">Voir</a>
                <a href="#" class="text-blue-600 hover:text-blue-900">Télécharger</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
    
    <!-- Section de paiement -->
    <div class="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Effectuer un paiement
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          Règlement sécurisé par carte bancaire
        </p>
      </div>
      <div class="px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Montant à régler</label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">€</span>
              </div>
              <input type="text" class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md" placeholder="0.00">
              <div class="absolute inset-y-0 right-0 flex items-center">
                <label for="currency" class="sr-only">Devise</label>
                <select id="currency" name="currency" class="focus:ring-blue-500 focus:border-blue-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md">
                  <option>EUR</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Carte de paiement</label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input type="text" class="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="1234 1234 1234 1234">
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Date d'expiration</label>
              <input type="text" class="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="MM/AA">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Code de sécurité</label>
              <input type="text" class="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="CVC">
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="save-card" name="save-card" type="checkbox" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded">
            </div>
            <div class="ml-3 text-sm">
              <label for="save-card" class="font-medium text-gray-700">Enregistrer cette carte pour des paiements futurs</label>
              <p class="text-gray-500">Vos informations de paiement seront stockées de manière sécurisée.</p>
            </div>
          </div>
          
          <div class="mt-6">
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Payer maintenant
            </button>
          </div>
          
          <div class="mt-4 text-center">
            <p class="text-xs text-gray-500">
              Paiement sécurisé avec <span class="font-medium">Stripe</span>
              <svg class="h-5 w-5 inline-block ml-1 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.502 0-.98.8-1.58 2.3-1.58 1.39 0 2.77.8 2.99 2.4h2.63c-.07-2.27-1.5-4.1-3.8-4.84V0h-3.33v1.88c-1.7.3-3.3 1.2-4.6 2.6l1.4 1.8c.9-1 2.2-1.7 3.2-1.9v1.5c-2.4.4-5 1.5-5 4.1 0 2.5 2.3 3.8 5 4.6 2.4.8 3.4 1.5 3.4 2.6 0 .6-.4 1.7-2.4 1.7-1.8 0-3.7-1.2-4.1-3.3H5.326c.4 2.8 2.4 4.5 5.3 4.9V24h3.34v-1.9c1.8-.3 3.4-1.1 4.6-2.5l-1.4-1.8c-1 1.1-2.2 1.8-3.2 2v-1.6c2.3-.5 5-1.7 5-4.1 0-2.7-2.1-4.05-5.2-4.85z"/>
              </svg>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Données de démonstration
const payments = [
  {
    id: 1,
    date: '05/05/2023',
    reference: 'PAY-2023-001',
    period: 'Mai 2023',
    amount: '1 200,00',
    status: 'Payé'
  },
  {
    id: 2,
    date: '05/04/2023',
    reference: 'PAY-2023-002',
    period: 'Avril 2023',
    amount: '1 200,00',
    status: 'Payé'
  },
  {
    id: 3,
    date: '05/03/2023',
    reference: 'PAY-2023-003',
    period: 'Mars 2023',
    amount: '1 200,00',
    status: 'Payé'
  },
  {
    id: 4,
    date: '05/02/2023',
    reference: 'PAY-2023-004',
    period: 'Février 2023',
    amount: '1 200,00',
    status: 'Payé'
  },
  {
    id: 5,
    date: '05/01/2023',
    reference: 'PAY-2023-005',
    period: 'Janvier 2023',
    amount: '1 200,00',
    status: 'Payé'
  }
];
</script>
