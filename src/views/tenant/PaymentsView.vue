<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Mes paiements</h1>
        <p class="text-gray-600">Consultez l'historique et l'état de vos paiements</p>
      </div>
      <div class="flex space-x-4">
        <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Télécharger mon relevé
        </button>
      </div>
    </div>

    <!-- Résumé des paiements -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Paiement actuel</p>
            <p class="text-2xl font-bold">{{ formatCurrency(currentMonthPayment?.amount || 0) }}</p>
            <p class="text-sm text-gray-500">Échéance le {{ formatDate(currentMonthPayment?.dueDate) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Prochain paiement</p>
            <p class="text-2xl font-bold">{{ formatCurrency(nextMonthPayment?.amount || 0) }}</p>
            <p class="text-sm text-gray-500">Échéance le {{ formatDate(nextMonthPayment?.dueDate) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Solde dû</p>
            <p class="text-2xl font-bold">{{ formatCurrency(overdueAmount) }}</p>
            <p class="text-sm text-amber-600" v-if="overdueAmount > 0">Paiement en retard</p>
            <p class="text-sm text-gray-500" v-else>À jour</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Historique des paiements -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium">Historique des paiements</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de paiement
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ payment.reference }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ payment.period }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ formatCurrency(payment.amount) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ payment.paidDate ? formatDate(payment.paidDate) : '—' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusClasses(payment.status)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getStatusText(payment.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  v-if="payment.status === 'pending'" 
                  @click="makePayment(payment)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Payer maintenant
                </button>
                <button 
                  @click="viewReceipt(payment)" 
                  class="text-gray-600 hover:text-gray-900"
                  :class="{ 'text-gray-300 cursor-not-allowed': !payment.receiptAvailable }"
                  :disabled="!payment.receiptAvailable"
                >
                  Reçu
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Précédent
          </button>
          <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Suivant
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Affichage de <span class="font-medium">1</span> à <span class="font-medium">{{ payments.length }}</span> sur <span class="font-medium">{{ payments.length }}</span> résultats
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Section d'aide -->
    <div class="mt-8 bg-blue-50 rounded-lg p-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Besoin d'aide pour vos paiements ?</h3>
          <div class="mt-2 text-sm text-blue-700">
            <p>Si vous rencontrez des difficultés pour effectuer un paiement ou si vous avez des questions, n'hésitez pas à contacter notre service client.</p>
          </div>
          <div class="mt-4">
            <button class="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-600">
              Contacter le support
              <svg class="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Données factices pour les paiements
const payments = ref([
  {
    id: 1,
    reference: 'PAY-2025-006',
    period: 'Juillet 2025',
    amount: 850,
    dueDate: '2025-07-05',
    paidDate: '2025-07-01',
    status: 'paid',
    receiptAvailable: true
  },
  {
    id: 2,
    reference: 'PAY-2025-005',
    period: 'Juin 2025',
    amount: 850,
    dueDate: '2025-06-05',
    paidDate: '2025-06-01',
    status: 'paid',
    receiptAvailable: true
  },
  {
    id: 3,
    reference: 'PAY-2025-004',
    period: 'Mai 2025',
    amount: 850,
    dueDate: '2025-05-05',
    paidDate: '2025-05-02',
    status: 'paid',
    receiptAvailable: true
  },
  {
    id: 4,
    reference: 'PAY-2025-003',
    period: 'Avril 2025',
    amount: 850,
    dueDate: '2025-04-05',
    paidDate: '2025-04-01',
    status: 'paid',
    receiptAvailable: true
  },
  {
    id: 5,
    reference: 'PAY-2025-002',
    period: 'Mars 2025',
    amount: 850,
    dueDate: '2025-03-05',
    paidDate: '2025-03-01',
    status: 'paid',
    receiptAvailable: true
  },
  {
    id: 6,
    reference: 'PAY-2025-001',
    period: 'Février 2025',
    amount: 800, // Augmentation du loyer
    dueDate: '2025-02-05',
    paidDate: '2025-02-01',
    status: 'paid',
    receiptAvailable: true,
    notes: 'Dernier paiement avant augmentation de loyer'
  }
]);

// Paiement du mois en cours
const currentMonthPayment = computed(() => {
  return {
    amount: 850,
    dueDate: '2025-08-05',
    status: 'pending'
  };
});

// Paiement du mois prochain
const nextMonthPayment = computed(() => {
  return {
    amount: 850,
    dueDate: '2025-09-05',
    status: 'upcoming'
  };
});

// Montant des paiements en retard
const overdueAmount = computed(() => {
  // Dans un cas réel, on filtrerait les paiements en retard
  return 0;
});

// Formater la date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '—';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Formater la monnaie
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Obtenir les classes CSS en fonction du statut
const getStatusClasses = (status: string): string => {
  const classes = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    upcoming: 'bg-blue-100 text-blue-800',
  };
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

// Obtenir le texte du statut
const getStatusText = (status: string): string => {
  const statusMap = {
    paid: 'Payé',
    pending: 'En attente',
    overdue: 'En retard',
    upcoming: 'À venir',
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

// Effectuer un paiement
const makePayment = (payment: any) => {
  // Ici, vous pourriez intégrer une passerelle de paiement
  console.log('Paiement en cours pour:', payment);
  
  // Simulation de paiement réussi après 1,5 secondes
  setTimeout(() => {
    const index = payments.value.findIndex(p => p.id === payment.id);
    if (index !== -1) {
      payments.value[index] = {
        ...payments.value[index],
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        receiptAvailable: true
      };
      
      // Afficher une notification de succès
      alert('Paiement effectué avec succès !');
    }
  }, 1500);
};

// Voir un reçu
const viewReceipt = (payment: any) => {
  // Ici, vous pourriez afficher un PDF ou une page de reçu
  console.log('Voir le reçu pour le paiement:', payment);
  window.open(`/receipts/${payment.reference}.pdf`, '_blank');
};

// Chargement initial des données
onMounted(() => {
  // Ici, vous pourriez charger les données depuis une API
  console.log('Chargement des paiements du locataire...');
});
</script>
