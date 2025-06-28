<template>
  <div class="container mx-auto px-4 py-8">
    <PropertyForm 
      :property-id="propertyId" 
      @submit="onFormSubmit" 
      @cancel="onFormCancel" 
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePropertyStore } from '@/stores/propertyStore';
import PropertyForm from '@/components/landlord/properties/PropertyForm.vue';

const props = defineProps<{
  id: string;
}>();

const router = useRouter();
const propertyStore = usePropertyStore();

const propertyId = Number(props.id);

onMounted(() => {
  if (propertyId) {
    propertyStore.fetchPropertyById(propertyId);
  }
});

const onFormSubmit = () => {
  router.push({ name: 'landlord-property-details', params: { id: propertyId } });
};

const onFormCancel = () => {
  router.push({ name: 'landlord-property-details', params: { id: propertyId } });
};
</script>
