<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="font-semibold text-lg mb-4">Transactions récentes</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="py-2 px-3 text-left text-sm font-semibold">#</th>
            <th class="py-2 px-3 text-left text-sm font-semibold">Propriété</th>
            <th class="py-2 px-3 text-left text-sm font-semibold">Montant</th>
            <th class="py-2 px-3 text-left text-sm font-semibold">Garantie ?</th>
            <th class="py-2 px-3 text-left text-sm font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transaction, index) in transactions" :key="index" class="border-b border-gray-200">
            <td class="py-2 px-3 text-sm font-semibold">{{ transaction.id }}</td>
            <td class="py-2 px-3 text-sm">{{ transaction.property }}</td>
            <td class="py-2 px-3 text-sm">{{ transaction.amount }}$</td>
            <td class="py-2 px-3 text-sm">{{ transaction.guarantee ? 'Oui' : 'Non' }}</td>
            <td class="py-2 px-3 text-sm">{{ transaction.date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Transaction {
  id: number
  property: string
  amount: string
  guarantee: boolean
  date: string
}

interface Props {
  transactions: Transaction[]
}

const props = defineProps<Props>()
</script>
