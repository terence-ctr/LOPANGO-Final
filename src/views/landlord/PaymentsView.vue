<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Suivi des paiements</h1>
      <div class="flex space-x-4">
        <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Exporter
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Propriété</label>
          <select class="w-full p-2 border rounded-md">
            <option>Toutes les propriétés</option>
            <option v-for="property in properties" :key="property.id" :value="property.id">
              {{ property.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select class="w-full p-2 border rounded-md">
            <option>Tous les statuts</option>
            <option>Payé</option>
            <option>En attente</option>
            <option>En retard</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Du</label>
          <input type="date" class="w-full p-2 border rounded-md">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Au</label>
          <input type="date" class="w-full p-2 border rounded-md">
        </div>
      </div>
    </div>

    <!-- Tableau des paiements -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Locataire
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propriété
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'échéance
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
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-gray-600">{{ payment.tenant.charAt(0) }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ payment.tenant }}</div>
                    <div class="text-sm text-gray-500">{{ payment.tenantEmail }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ payment.propertyName }}</div>
                <div class="text-sm text-gray-500">{{ payment.propertyAddress }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ formatCurrency(payment.amount) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(payment.dueDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900" :class="{ 'text-gray-400': !payment.paidDate }">
                  {{ payment.paidDate ? formatDate(payment.paidDate) : 'En attente' }}
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
                  v-if="!payment.paidDate" 
                  @click="markAsPaid(payment)"
                  class="text-green-600 hover:text-green-900 mr-3"
                >
                  Marquer comme payé
                </button>
                <button 
                  @click="viewDetails(payment)" 
                  class="text-blue-600 hover:text-blue-900"
                >
                  Détails
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
              Affichage de <span class="font-medium">1</span> à <span class="font-medium">10</span> sur <span class="font-medium">{{ payments.length }}</span> résultats
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">Précédent</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </button>
              <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">Suivant</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Données factices pour les propriétés
const properties = ref([
  { id: 1, name: 'Appartement T2 - Paris 11e' },
  { id: 2, name: 'Studio - Montreuil' },
  { id: 3, name: 'Maison - Vincennes' },
]);

// Données factices pour les paiements
const payments = ref([
  {
    id: 1,
    tenant: 'Jean Dupont',
    tenantEmail: 'jean.dupont@example.com',
    propertyId: 1,
    propertyName: 'Appartement T2 - Paris 11e',
    propertyAddress: '15 Rue de la Roquette, 75011 Paris',
    amount: 850,
    dueDate: '2025-07-05',
    paidDate: '2025-07-01',
    status: 'paid',
    reference: 'PAY-2025-001'
  },
  {
    id: 2,
    tenant: 'Marie Martin',
    tenantEmail: 'marie.martin@example.com',
    propertyId: 2,
    propertyName: 'Studio - Montreuil',
    propertyAddress: '22 Avenue de la République, 93100 Montreuil',
    amount: 650,
    dueDate: '2025-07-05',
    paidDate: null,
    status: 'pending',
    reference: 'PAY-2025-002'
  },
  {
    id: 3,
    tenant: 'Pierre Durand',
    tenantEmail: 'pierre.durand@example.com',
    propertyId: 3,
    propertyName: 'Maison - Vincennes',
    propertyAddress: '8 Rue de Fontenay, 94300 Vincennes',
    amount: 1200,
    dueDate: '2025-06-25',
    paidDate: null,
    status: 'overdue',
    reference: 'PAY-2025-003'
  },
  {
    id: 4,
    tenant: 'Sophie Bernard',
    tenantEmail: 'sophie.bernard@example.com',
    propertyId: 4,
    propertyName: 'Appartement T3 - Paris 20e',
    propertyAddress: '45 Rue des Pyrénées, 75020 Paris',
    amount: 950,
    dueDate: '2025-08-05',
    paidDate: null,
    status: 'upcoming',
    reference: 'PAY-2025-004'
  },
  {
    id: 5,
    tenant: 'Thomas Moreau',
    tenantEmail: 'thomas.moreau@example.com',
    propertyId: 5,
    propertyName: 'Studio - Bagnolet',
    propertyAddress: '12 Rue Sadi Carnot, 93170 Bagnolet',
    amount: 700,
    dueDate: '2025-06-05',
    paidDate: '2025-06-01',
    status: 'paid',
    reference: 'PAY-2025-005'
  }
]);

// Formater la date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
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

// Marquer un paiement comme payé
const markAsPaid = (payment: any) => {
  const index = payments.value.findIndex(p => p.id === payment.id);
  if (index !== -1) {
    payments.value[index] = {
      ...payments.value[index],
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0]
    };
  }
};

// Voir les détails d'un paiement
const viewDetails = (payment: any) => {
  // Ici, vous pourriez naviguer vers une page de détail ou afficher une modale
  console.log('Voir les détails du paiement:', payment);
};

// Chargement initial des données
onMounted(() => {
  // Ici, vous pourriez charger les données depuis une API
  console.log('Chargement des paiements...');
});
</script>
