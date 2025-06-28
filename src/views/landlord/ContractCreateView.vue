<template>
  <main class="max-w-5xl mx-auto px-6 pb-12">
    <h1 class="font-extrabold text-base leading-5 my-4">
      Créer un contrat
    </h1>
    <form @submit.prevent="submitForm" class="space-y-10">
      <!-- Informations du Bailleur -->
      <section>
        <h2 class="font-semibold text-sm mb-4">Informations du Bailleur</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-w-3xl">
          <div>
            <label class="block text-xs mb-1" for="bailleur-titre">Choisir titulaire</label>
            <select class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="bailleur-titre" v-model="form.landlord.id">
              <option disabled value="">Choisissez un bailleur</option>
              <option v-for="l in landlords" :key="l._id" :value="l._id">{{ l.firstName }} {{ l.lastName }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs mb-1" for="bailleur-nationalite">Choisir nationalité</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedLandlord}" id="bailleur-nationalite" type="text" v-model="form.landlord.nationality" :readonly="!!selectedLandlord"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="bailleur-numero">Numéro de la carte d'identité</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedLandlord}" id="bailleur-numero" type="text" v-model="form.landlord.identity.nationalId" :readonly="!!selectedLandlord"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="bailleur-type-carte">Type de la carte d'identité</label>
            <select class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedLandlord}" id="bailleur-type-carte" v-model="form.landlord.identity.documentType" :disabled="!!selectedLandlord">
              <option>Carte d'électeur</option>
              <option>Passeport</option>
              <option>Permis de conduire</option>
            </select>
          </div>
          <div>
            <label class="block text-xs mb-1" for="bailleur-avenue">Avenue</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedLandlord}" id="bailleur-avenue" type="text" v-model="form.landlord.address.street" :readonly="!!selectedLandlord"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="bailleur-quartier">Quartier</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedLandlord}" id="bailleur-quartier" type="text" v-model="form.landlord.address.quartier" :readonly="!!selectedLandlord"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="bailleur-commune">Commune</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedLandlord}" id="bailleur-commune" type="text" v-model="form.landlord.address.commune" :readonly="!!selectedLandlord"/>
          </div>
        </div>
      </section>

      <!-- Informations du Locataire -->
      <section>
        <h2 class="font-semibold text-sm mb-4">Informations du Locataire</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-w-3xl">
          <div>
            <label class="block text-xs mb-1" for="locataire-titre">Choisir titulaire</label>
            <select class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="locataire-titre" v-model="form.tenant.id">
              <option disabled value="">Choisissez un locataire</option>
              <option v-for="t in tenants" :key="t._id" :value="t._id">{{ t.firstName }} {{ t.lastName }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs mb-1" for="locataire-nationalite">Choisir nationalité</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedTenant}" id="locataire-nationalite" type="text" v-model="form.tenant.nationality" :readonly="!!selectedTenant"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="locataire-numero">Numéro de la carte d'identité</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedTenant}" id="locataire-numero" type="text" v-model="form.tenant.identity.nationalId" :readonly="!!selectedTenant"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="locataire-type-carte">Type de la carte d'identité</label>
            <select class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedTenant}" id="locataire-type-carte" v-model="form.tenant.identity.documentType" :disabled="!!selectedTenant">
              <option>Carte d'électeur</option>
              <option>Passeport</option>
              <option>Permis de conduire</option>
            </select>
          </div>
          <div>
            <label class="block text-xs mb-1" for="locataire-avenue">Avenue</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedTenant}" id="locataire-avenue" type="text" v-model="form.tenant.address.street" :readonly="!!selectedTenant"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="locataire-quartier">Quartier</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedTenant}" id="locataire-quartier" type="text" v-model="form.tenant.address.quartier" :readonly="!!selectedTenant"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="locataire-commune">Commune</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedTenant}" id="locataire-commune" type="text" v-model="form.tenant.address.commune" :readonly="!!selectedTenant"/>
          </div>
        </div>
      </section>

      <!-- Clauses du contrat -->
      <section>
        <h2 class="font-semibold text-sm mb-4">Clauses du contrat</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-w-3xl">
          <div>
            <label class="block text-xs mb-1" for="clause-propriete">Propriété</label>
            <select class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-propriete" v-model="form.contract.propertyId">
              <option disabled value="">Choisissez une propriété</option>
              <option v-for="p in properties" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs mb-1" for="clause-usage">Usage</label>
            <select class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-usage" >
              <option>Résidentiel</option>
              <option v-for="p in properties" :key="p.id" :value="p.type">{{ p.type }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs mb-1" for="clause-loyer">Loyer</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-loyer" type="text" v-model="form.contract.rent"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="clause-devise">Devise</label>
            <select class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-devise" v-model="form.contract.currency">
              <option>USD</option>
              <option>CDF</option>
            </select>
          </div>
          <div>
            <label class="block text-xs mb-1" for="clause-caution">Caution</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-caution" type="text" v-model="form.contract.deposit"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="clause-duree">Durée</label>
            <select class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-duree" v-model="form.contract.duration">
              <option>1 an</option>
              <option>2 ans</option>
              <option>3 ans</option>
              <option>Indéterminée</option>
            </select>
          </div>
          <div>
            <label class="block text-xs mb-1" for="clause-start-date">Date de début</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-start-date" type="date" v-model="form.contract.startDate"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="clause-end-date">Date de fin</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-end-date" type="date" v-model="form.contract.endDate"/>
          </div>
        </div>
      </section>

      <div class="flex space-x-4 max-w-3xl mt-8">
        <button @click="cancel" class="bg-red-400 hover:bg-red-500 text-white text-xs font-semibold rounded px-6 py-2" type="button">Annuler</button>
        <button class="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded px-6 py-2" type="submit">Créer contrat</button>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { usePropertyStore } from '@/stores/propertyStore';
import { useContractStore } from '@/stores/contractStore';
import { useTenantStore } from '@/stores/tenantStore';
import { useLandlordStore } from '@/stores/landlordStore';
import type { ContractFormData } from '@/types/contract';

const router = useRouter();
const authStore = useAuthStore();
const propertyStore = usePropertyStore();
const contractStore = useContractStore();
const tenantStore = useTenantStore();
const landlordStore = useLandlordStore();

const { currentUser: currentUser } = storeToRefs(authStore);
const { properties } = storeToRefs(propertyStore);
const { tenants } = storeToRefs(tenantStore);
const { landlords } = storeToRefs(landlordStore);

const form = reactive({
  landlord: {
    id: '',
    nationality: '',
    identity: {
      nationalId: '',
      documentType: 'carte d\'électeur',
    },
    address: {
      street: '',
      quartier: '',
      commune: '',
    },
  },
  tenant: {
    id: '',
    nationality: '',
    identity: {
      nationalId: '',
      documentType: 'carte d\'électeur',
    },
    address: { street: '', quartier: '', commune: '' },
  },
  contract: {
    propertyId: '',
    usage: 'Résidentiel',
    rent: '',
    currency: 'USD',
    deposit: '',
    duration: '1 an',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  },
});

const selectedProperty = computed(() => properties.value.find(p => p.id === form.contract.propertyId));

const selectedTenant = computed(() => {
  if (!form.tenant.id) return null;
  return tenantStore.getTenantById(form.tenant.id);
});

const selectedLandlord = computed(() => {
  if (!form.landlord.id) return null;
  return landlordStore.getLandlordById(form.landlord.id);
});

watch(selectedProperty, (newProperty) => {
  if (newProperty) {
    form.contract.usage = newProperty.usage || 'Résidentiel';
    form.contract.rent = newProperty.rent?.toString() || '';
    form.contract.deposit = newProperty.deposit?.toString() || '';
  }
});

watch(selectedTenant, (newTenant) => {
  if (newTenant) {
    form.tenant.nationality = newTenant.nationality;
    form.tenant.identity.nationalId = newTenant.identity.nationalId;
    form.tenant.identity.documentType = newTenant.identity.documentType;
    form.tenant.address.street = newTenant.address.street;
    form.tenant.address.quartier = newTenant.address.quartier;
    form.tenant.address.commune = newTenant.address.commune;
  } else {
    // Reset tenant form when no tenant is selected
    form.tenant.nationality = '';
    form.tenant.identity.nationalId = '';
    form.tenant.identity.documentType = 'carte d\'électeur';
    form.tenant.address.street = '';
    form.tenant.address.quartier = '';
    form.tenant.address.commune = '';
  }
});

watch(selectedLandlord, (newLandlord) => {
  if (newLandlord) {
    form.landlord.nationality = newLandlord.nationality;
    form.landlord.identity.nationalId = newLandlord.identity.nationalId;
    form.landlord.identity.documentType = newLandlord.identity.documentType;
    form.landlord.address.street = newLandlord.address.street;
    form.landlord.address.quartier = newLandlord.address.quartier;
    form.landlord.address.commune = newLandlord.address.commune;
  } else {
    // Reset landlord form when no landlord is selected
    form.landlord.nationality = '';
    form.landlord.identity.nationalId = '';
    form.landlord.identity.documentType = 'carte d\'électeur';
    form.landlord.address.street = '';
    form.landlord.address.quartier = '';
    form.landlord.address.commune = '';
  }
});

onMounted(() => {
  propertyStore.fetchProperties();
  tenantStore.fetchTenants();
  landlordStore.fetchLandlords();
});

const submitForm = async () => {
  const contractData: ContractFormData = {
    propertyId: form.contract.propertyId,
    landlordId: form.landlord.id,
    landlordNationality: form.landlord.nationality,
    landlordIdNumber: form.landlord.identity.nationalId,
    landlordIdType: form.landlord.identity.documentType,
    landlordAddress: form.landlord.address,
    tenantId: form.tenant.id,
    tenantNationality: form.tenant.nationality,
    tenantIdNumber: form.tenant.identity.nationalId,
    tenantIdType: form.tenant.identity.documentType,
    tenantAddress: form.tenant.address,
    usage: form.contract.usage,
    rent: form.contract.rent,
    currency: form.contract.currency,
    deposit: form.contract.deposit,
    duration: form.contract.duration,
    startDate: form.contract.startDate,
    endDate: form.contract.endDate,
    status: 'pending',
  };

  try {
    await contractStore.createContract(contractData);
    router.push({ name: 'LandlordContracts' });
  } catch (error) {
    console.error('Error creating contract:', error);
  }
};

const cancel = () => {
  router.push({ name: 'landlord-contracts' });
};
</script>
