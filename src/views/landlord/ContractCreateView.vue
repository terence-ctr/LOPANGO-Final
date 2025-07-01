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
          <!-- Champ des conditions spéciales -->
          <div class="col-span-full">
            <label class="block text-xs mb-1" for="special-conditions">Conditions spéciales</label>
            <textarea 
              id="special-conditions"
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 min-h-[100px]"
              v-model="form.contract.specialConditions"
              placeholder="Entrez toutes les conditions spéciales du contrat ici..."
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
import type { Property } from '@/types/property';
import { mapContractToApiFormat } from '@/utils/contractMapper';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { usePropertyStore } from '@/stores/propertyStore';
import { useContractStore } from '@/stores/contractStore';
import { useTenantStore } from '@/stores/tenantStore';
import { useLandlordStore } from '@/stores/landlordStore';
import type { ContractFormData, IdType, PropertyUsage } from '@/types/contract';
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

// Charger les propriétés au montage du composant
onMounted(async () => {
  try {
    await propertyStore.fetchProperties();
  } catch (error) {
    console.error('Erreur lors du chargement des propriétés:', error);
  }
});

const { currentUser: currentUser } = storeToRefs(authStore);
const propertyStoreRefs = storeToRefs(propertyStore);
const properties = computed(() => propertyStore.getProperties);
const { tenants } = storeToRefs(tenantStore);
const { landlords } = storeToRefs(landlordStore);

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
    specialConditions: ''
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

onMounted(() => {
  propertyStore.fetchProperties();
  tenantStore.fetchTenants();
  landlordStore.fetchLandlords();
});

const submitForm = async () => {
  try {
    // Préparer les données du formulaire selon l'interface ContractFormData
    const formData: ContractFormData = {
      // Informations du bailleur (tous les champs requis)
      landlordId: form.landlord.id,
      landlordNationality: form.landlord.nationality || 'Non spécifiée',
      landlordIdType: mapDocumentType(form.landlord.identity.documentType),
      landlordIdNumber: form.landlord.identity.nationalId || '',
      landlordAddress: {
        street: form.landlord.address.street || 'Non spécifiée',
        city: form.landlord.address.city || 'Non spécifiée',
        postalCode: form.landlord.address.postal_code || '',
        country: form.landlord.address.country || 'RDC'
      },
      
      // Informations du locataire (tous les champs requis)
      tenantId: form.tenant.id,
      tenantNationality: form.tenant.nationality || 'Non spécifiée',
      tenantIdType: mapDocumentType(form.tenant.identity.documentType),
      tenantIdNumber: form.tenant.identity.nationalId || '',
      tenantAddress: {
        street: form.tenant.address.street || 'Non spécifiée',
        city: form.tenant.address.city || 'Non spécifiée',
        postalCode: form.tenant.address.postal_code || '',
        country: form.tenant.address.country || 'RDC'
      },
      
      // Informations du contrat (tous les champs requis)
      propertyId: form.contract.propertyId,
      usage: (form.contract.usage.toLowerCase() as PropertyUsage) || 'residentiel',
      rent: form.contract.rent || '0',
      currency: form.contract.currency || 'USD',
      deposit: form.contract.deposit || '0',
      duration: form.contract.duration || '1 an',
      startDate: form.contract.startDate || new Date().toISOString().split('T')[0],
      endDate: form.contract.endDate || '',
      paymentDay: form.contract.paymentDay ? parseInt(form.contract.paymentDay.toString()) : null,
      status: 'draft',
      specialConditions: form.contract.specialConditions || ''
    };

    console.log('Données du formulaire :', formData);
    
    // Convertir les données du formulaire au format attendu par l'API
    const contractData = mapContractToApiFormat(formData);
    console.log('Données envoyées à l\'API :', contractData);

    // Utilisation du store pour créer le contrat
    await contractStore.createContract(contractData);
    
    // Redirection vers la liste des contrats
    router.push({ name: 'landlord-contracts' });
    
  } catch (error: any) {
    console.error('Erreur lors de la création du contrat :', error);
    // Afficher un message d'erreur à l'utilisateur
    alert(error?.message || 'Une erreur est survenue lors de la création du contrat');
  }
};

const cancel = () => {
  router.push({ name: 'landlord-contracts' });
};
</script>
