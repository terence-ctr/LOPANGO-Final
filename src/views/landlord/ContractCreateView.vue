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
              <option value="carte_electeur">Carte d'électeur</option>
              <option value="passeport">Passeport</option>
              <option value="permis_de_conduire">Permis de conduire</option>
              <option value="carte_sejour">Carte de séjour</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label class="block text-xs mb-1" for="bailleur-avenue">Avenue</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedLandlord}" id="bailleur-avenue" type="text" v-model="form.landlord.address.street" :readonly="!!selectedLandlord"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="bailleur-ville">Ville</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedLandlord}" id="bailleur-ville" type="text" v-model="form.landlord.address.city" :readonly="!!selectedLandlord"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="bailleur-code-postal">Code Postal</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedLandlord}" id="bailleur-code-postal" type="text" v-model="form.landlord.address.postal_code" :readonly="!!selectedLandlord"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="bailleur-pays">Pays</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedLandlord}" id="bailleur-pays" type="text" v-model="form.landlord.address.country" :readonly="!!selectedLandlord"/>
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
              <option value="carte_electeur">Carte d'électeur</option>
              <option value="passeport">Passeport</option>
              <option value="permis_de_conduire">Permis de conduire</option>
              <option value="carte_sejour">Carte de séjour</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label class="block text-xs mb-1" for="locataire-avenue">Avenue</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedTenant}" id="locataire-avenue" type="text" v-model="form.tenant.address.street" :readonly="!!selectedTenant"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="locataire-ville">Ville</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedTenant}" id="locataire-ville" type="text" v-model="form.tenant.address.city" :readonly="!!selectedTenant"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="locataire-code-postal">Code Postal</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedTenant}" id="locataire-code-postal" type="text" v-model="form.tenant.address.postal_code" :readonly="!!selectedTenant"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="locataire-pays">Pays</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" :class="{'bg-gray-100': !!selectedTenant}" id="locataire-pays" type="text" v-model="form.tenant.address.country" :readonly="!!selectedTenant"/>
          </div>
        </div>
      </section>
      <section>
            <h2 class="font-semibold text-sm mb-4">Informations de l'Agent Immobilier (facultatif)</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-w-3xl">
              <div>
                <label class="block text-xs mb-1" for="agent-nom">Choisir l'agent</label>
                <select 
                  class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" 
                  id="agent-nom" 
                  v-model="form.contract.agentId"
                >
                  <option value="">Sélectionner un agent</option>
                  <option 
                    v-for="agent in agents" 
                    :key="agent._id" 
                    :value="agent._id"
                  >
                    {{ agent.firstName }} {{ agent.lastName }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs mb-1" for="agent-email">Email</label>
                <input 
                  class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-100" 
                  id="agent-email" 
                  type="text" 
                  :value="selectedAgent?.email || ''" 
                  readonly
                />
              </div>
              <div>
                <label class="block text-xs mb-1" for="agent-telephone">Téléphone</label>
                <input 
                  class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-100" 
                  id="agent-telephone" 
                  type="text" 
                  :value="selectedAgent?.phone || ''" 
                  readonly
                />
              </div>
              <div>
                <label class="block text-xs mb-1" for="agent-avenue">Avenue</label>
                <input 
                  class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-100" 
                  id="agent-avenue" 
                  type="text" 
                  :value="selectedAgent?.address?.street || ''" 
                  readonly
                />
              </div>
              <div>
                <label class="block text-xs mb-1" for="agent-ville">Ville</label>
                <input 
                  class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-100" 
                  id="agent-ville" 
                  type="text" 
                  :value="selectedAgent?.address?.city || ''" 
                  readonly
                />
              </div>
              <div>
                <label class="block text-xs mb-1" for="agent-code-postal">Code Postal</label>
                <input 
                  class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-100" 
                  id="agent-code-postal" 
                  type="text" 
                  :value="selectedAgent?.address?.postal_code || ''" 
                  readonly
                />
              </div>
              <div>
                <label class="block text-xs mb-1" for="agent-pays">Pays</label>
                <input 
                  class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-100" 
                  id="agent-pays" 
                  type="text" 
                  :value="selectedAgent?.address?.country || ''" 
                  readonly
                />
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
            <input 
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs bg-gray-100" 
              id="clause-usage" 
              :value="selectedProperty ? selectedProperty.type : ''"
              readonly
            />
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
            <label class="block text-xs mb-1" for="clause-caution">Charges</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-caution" type="text" v-model="form.contract.deposit"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="clause-duree">Durée</label>
            <select class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-duree" v-model="form.contract.duration">
              <option value="1 an">1 an</option>
              <option value="2 ans">2 ans</option>
              <option value="3 ans">3 ans</option>
              <option value="4 ans">4 ans</option>
              <option value="5 ans">5 ans</option>
            </select>
          </div>
        
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="special-conditions">
              Conditions spéciales
            </label>
            <textarea
              id="special-conditions"
              v-model="form.contract.specialConditions"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              placeholder="Entrez les conditions spéciales du contrat (facultatif)"
            ></textarea>
          </div>
          <div>
            <label class="block text-xs mb-1" for="clause-start-date">Date de début</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-start-date" type="date" v-model="form.contract.startDate"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="clause-end-date">Date de fin</label>
            <input class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" id="clause-end-date" type="date" v-model="form.contract.endDate"/>
          </div>
          <div>
            <label class="block text-xs mb-1" for="clause-payment-day">Jour de paiement (optionnel)</label>
            <input 
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" 
              id="clause-payment-day" 
              type="number" 
              min="1" 
              max="31" 
              v-model="form.contract.paymentDay"
              placeholder="Jour du mois (1-31)"
            />
            <p class="text-xs text-gray-500 mt-1">Laissez vide pour utiliser le jour de début de contrat</p>
          </div>
        </div>

        <!-- Détails de la propriété sélectionnée -->
        <div v-if="selectedProperty" class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 class="font-semibold text-sm mb-3">Détails de la propriété</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500">Titre</p>
              <p class="text-sm font-medium">{{ selectedProperty.title }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Type</p>
              <p class="text-sm font-medium">{{ selectedProperty.type }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Surface</p>
              <p class="text-sm font-medium">{{ selectedProperty.area }} m²</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Chambres</p>
              <p class="text-sm font-medium">{{ selectedProperty.bedrooms }}</p>
            </div>
            <div class="sm:col-span-2">
              <p class="text-xs text-gray-500">Adresse</p>
              <p class="text-sm font-medium">
                {{ selectedProperty.address }}
              </p>
            </div>
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
import { reactive, computed, onMounted, watch, defineComponent, Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePropertyStore } from '@/stores/propertyStore';
import { useContractStore } from '@/stores/contractStore';
import { useTenantStore } from '@/stores/tenantStore';
import { useLandlordStore } from '@/stores/landlordStore';
import { useAgentStore } from '@/stores/agentStore';
import { storeToRefs } from 'pinia';
import type { Property, PropertyType } from '@/types/property';
import type { User, Address } from '@/types/user';
import type { ContractStatus, IdType, PropertyUsage, ContractFormData } from '@/types/contract';
import { propertyTypeLabels } from '@/types/property';

// Fonction utilitaire pour convertir le type de document
const mapDocumentType = (type: string): IdType => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('carte') && typeLower.includes('électeur')) {
    return 'carte_electeur';
  } else if (typeLower.includes('permis') && typeLower.includes('conduire')) {
    return 'permis_de_conduire';
  } else if (typeLower.includes('passeport')) {
    return 'passeport';
  } else if (typeLower.includes('séjour') || typeLower.includes('sejour')) {
    return 'carte_sejour';
  }
  return 'autre';
};

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    submitForm: () => Promise<void>;
    cancel: () => void;
  }
}

const router = useRouter();
const authStore = useAuthStore();
const propertyStore = usePropertyStore();
const contractStore = useContractStore();
const tenantStore = useTenantStore();
const landlordStore = useLandlordStore();
const agentStore = useAgentStore();

// Charger les propriétés disponibles (sans contrat actif) au montage du composant
onMounted(async () => {
  try {
    await propertyStore.fetchProperties(true); // true pour ne charger que les propriétés disponibles
  } catch (error) {
    console.error('Erreur lors du chargement des propriétés disponibles:', error);
  }
});

const { currentUser: currentUser } = storeToRefs(authStore);
const propertyStoreRefs = storeToRefs(propertyStore);
const properties = computed(() => propertyStore.getProperties);
const { tenants } = storeToRefs(tenantStore);
const { landlords } = storeToRefs(landlordStore);
const { agents } = storeToRefs(agentStore);

const form = reactive({
  landlord: {
    id: '',
    nationality: 'Congolaise',
    identity: {
      nationalId: '',
      documentType: 'carte_electeur' as IdType,
    },
    address: {
      city: '',
      postal_code: '',
      country: '',
      street: ''
    },
  },
  tenant: {
    id: '',
    nationality: 'Congolaise',
    identity: {
      nationalId: '',
      documentType: 'carte_electeur' as IdType,
    },
    address: { street: '', city: '', postal_code: '', country: '' },
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
    paymentDay: null as number | null,
    specialConditions: '',
    agentId: ''
  } as {
    propertyId: string;
    usage: string;
    rent: string;
    currency: string;
    deposit: string;
    duration: string;
    startDate: string;
    endDate: string;
    paymentDay: number | null;
    specialConditions: string;
    agentId: string;
  },
});

const selectedProperty = computed(() => {
  if (!properties?.value) return null;
  return properties.value.find((p: Property) => p.id === form.contract.propertyId);
});

const selectedTenant = computed(() => {
  if (!form.tenant.id) return null;
  return tenantStore.getTenantById(form.tenant.id);
});

const selectedLandlord = computed(() => {
  if (!form.landlord.id) return null;
  return landlordStore.getLandlordById(form.landlord.id);
});

const selectedAgent = computed(() => {
  if (!form.contract.agentId) return null;
  return agentStore.getAgentById(form.contract.agentId);
});

watch(selectedProperty, (newProperty) => {
  if (newProperty) {
    form.contract.usage = newProperty.usage || 'Résidentiel';
    form.contract.rent = newProperty.rent?.toString() || '';
    form.contract.deposit = newProperty.deposit?.toString() || '';
    
    // Mettre à jour le type de propriété si disponible
    if (newProperty.type) {
      form.contract.usage = newProperty.type;
    }
  } else {
    // Réinitialiser les valeurs si aucune propriété n'est sélectionnée
    form.contract.usage = 'Résidentiel';
    form.contract.rent = '';
    form.contract.deposit = '';
  }
});

watch(selectedTenant, (newTenant) => {
  if (newTenant) {
    console.log('Locataire sélectionné:', newTenant);
    form.tenant.nationality = newTenant.nationality || '';
    form.tenant.identity.nationalId = newTenant.identity?.nationalId || '';
    form.tenant.identity.documentType = mapDocumentType(newTenant.identity?.documentType || 'carte_electeur');
    form.tenant.address.street = newTenant.address?.street || '';
    form.tenant.address.city = newTenant.address?.city || '';
    form.tenant.address.postal_code = newTenant.address?.postal_code || '';
    form.tenant.address.country = newTenant.address?.country || '';
  } else {
    // Reset tenant form when no tenant is selected
    form.tenant.nationality = 'Congolaise';
    form.tenant.identity.nationalId = '';
    form.tenant.identity.documentType = 'carte_electeur';
    form.tenant.address.street = '';
    form.tenant.address.city = '';
    form.tenant.address.postal_code = '';
    form.tenant.address.country = '';
  }
});

watch(selectedLandlord, (newLandlord) => {
  if (newLandlord) {
    console.log('Bailleur sélectionné:', newLandlord);
    console.log('Adresse du bailleur:', newLandlord.address);
    form.landlord.nationality = newLandlord.nationality || '';
    form.landlord.identity.nationalId = newLandlord.identity?.nationalId || '';
    form.landlord.identity.documentType = mapDocumentType(newLandlord.identity?.documentType || 'carte_electeur');
    form.landlord.address.street = newLandlord.address?.street || '';
    form.landlord.address.city = newLandlord.address?.city || '';
    form.landlord.address.postal_code = newLandlord.address?.postal_code || '';
    form.landlord.address.country = newLandlord.address?.country || '';
  } else {
    // Reset landlord form when no landlord is selected
    form.landlord.nationality = 'Congolaise';
    form.landlord.identity.nationalId = '';
    form.landlord.identity.documentType = 'carte_electeur';
    form.landlord.address.street = '';
    form.landlord.address.city = '';
    form.landlord.address.postal_code = '';
    form.landlord.address.country = '';
  }
});

watch(selectedAgent, (newAgent) => {
  if (newAgent) {
    console.log('Agent sélectionné:', newAgent);
    // Mettre à jour les informations de l'agent
  } else {
    // Réinitialiser les informations de l'agent
  }
});

onMounted(async () => {
  await Promise.all([
    propertyStore.fetchProperties(),
    tenantStore.fetchTenants(),
    landlordStore.fetchLandlords(),
    agentStore.fetchAgents()
  ]);
});

import { useToast, POSITION } from 'vue-toastification';

// Fonction utilitaire pour afficher les notifications d'erreur
const showErrorNotification = (error: any) => {
  const toast = useToast();
  
  // Si c'est une erreur de propriété déjà louée
  if (error?.response?.data?.code === 'PROPERTY_ALREADY_RENTED') {
    const details = error.response.data.details;
    const message = error.response.data.userMessage || 'Cette propriété est déjà louée';
    
    toast.error(message, {
      position: POSITION.TOP_RIGHT,
      timeout: 8000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      closeButton: true,
      icon: true,
      toastClassName: 'error-toast',
      bodyClassName: ['font-medium'],
      onClose: () => {
        // Rediriger vers la page de la propriété
        if (details?.propertyId) {
          router.push({ name: 'property-details', params: { id: details.propertyId } });
        }
      }
    });
  } else {
    // Erreur générique
    toast.error(
      error?.response?.data?.message || error?.message || 'Une erreur est survenue',
      {
        position: POSITION.TOP_RIGHT,
        timeout: 5000,
        closeOnClick: true,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: true,
        icon: true,
        toastClassName: 'error-toast',
        bodyClassName: ['font-medium']
      }
    );
  }
};

const submitForm = async () => {
  try {
    // Vérifier que toutes les données requises sont présentes
    if (!form.landlord.id || !form.tenant.id || !form.contract.propertyId) {
      const error = new Error('Veuillez remplir tous les champs obligatoires');
      showErrorNotification(error);
      return;
    }

    // Créer l'objet ContractFormData avec les données du formulaire
    const contractFormData: ContractFormData = {
      // Informations du bailleur
      landlordId: form.landlord.id,
      landlordNationality: form.landlord.nationality || 'Congolaise',
      landlordIdType: form.landlord.identity.documentType,
      landlordIdNumber: form.landlord.identity.nationalId || '',
      landlordAddress: {
        street: form.landlord.address.street || '',
        city: form.landlord.address.city || '',
        postalCode: form.landlord.address.postal_code || '',
        country: form.landlord.address.country || 'RDC'
      } as Address,
      
      // Informations du locataire
      tenantId: form.tenant.id,
      tenantNationality: form.tenant.nationality || 'Congolaise',
      tenantIdType: form.tenant.identity.documentType,
      tenantIdNumber: form.tenant.identity.nationalId || '',
      tenantAddress: {
        street: form.tenant.address.street || '',
        city: form.tenant.address.city || '',
        postalCode: form.tenant.address.postal_code || '',
        country: form.tenant.address.country || 'RDC'
      } as Address,
      
      // Informations du contrat
      propertyId: form.contract.propertyId,
      usage: form.contract.usage.toLowerCase() as PropertyUsage,
      rent: form.contract.rent || '0',
      currency: form.contract.currency || 'USD',
      deposit: form.contract.deposit || '0',
      duration: form.contract.duration || '1 an',
      startDate: form.contract.startDate || new Date().toISOString().split('T')[0],
      endDate: form.contract.endDate || '',
      paymentDay: form.contract.paymentDay ? parseInt(form.contract.paymentDay.toString()) : null,
      status: 'draft' as const,
      specialConditions: form.contract.specialConditions || '',
      agentId: form.contract.agentId || null
    };

    console.log('Données du formulaire :', contractFormData);
    
    // Utilisation du store pour créer le contrat
    await contractStore.createContract(contractFormData);
    
    // Redirection vers la liste des contrats
    router.push({ name: 'landlord-contracts' });
    
  } catch (error: any) {
    console.error('Erreur lors de la création du contrat :', error);
    // Afficher une notification d'erreur élégante
    showErrorNotification(error);
  }
};

const cancel = () => {
  router.push({ name: 'landlord-contracts' });
};
</script>
