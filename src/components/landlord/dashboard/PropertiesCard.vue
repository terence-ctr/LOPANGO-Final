<template>
  <div class="bg-white rounded-xl shadow-md p-6 w-full">
    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex flex-col items-center">
        <div class="property-count">
          {{ properties.length }}
        </div>
        <div class="property-info">
          <p class="property-count-label">Les propriétés</p>
          <a href="#" class="view-all-link" @click="viewAllProperties">
            Tout voir <i class="fas fa-arrow-right text-xs"></i>
          </a>
        </div>
      </div>
      <div class="flex-1 overflow-x-auto">
        <table class="property-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom de la propriété</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(property, index) in properties" :key="property.id">
              <td class="font-semibold">{{ (index + 1).toString().padStart(2, '0') }}</td>
              <td>{{ property.name }}</td>
              <td class="status-active">{{ property.status }}</td>
              <td class="text-gray-400 text-center cursor-pointer">...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const properties = ref([
  { id: 1, name: 'Appartement B20', status: 'Actif' },
  { id: 2, name: 'Appartement B10', status: 'Actif' }
]);

const viewAllProperties = () => {
  router.push('/landlord/properties');
};
</script>

<style scoped>
.property-table {
  width: 100%;
  border-collapse: collapse;
}

.property-table th,
.property-table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.property-table th {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem;
}

.property-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.status-active {
  color: #059669;
  font-weight: 600;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.view-all-link:hover {
  text-decoration: underline;
}

.property-count {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background-color: #1d4ed8;
  border-radius: 0.5rem;
  color: white;
  font-weight: 800;
  font-size: 1.875rem;
  line-height: 1;
}

.property-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 5rem;
  margin-top: 0.5rem;
}

.property-count-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.first {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji';
}
</style>