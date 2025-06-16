<template>
  <div class="max-w-4xl w-full justify-center px-4 py-8">
    <!-- Message d'erreur global -->
    <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>

    <!-- Indicateur de chargement principal -->
    <div v-if="isLoading.bailleurs || isLoading.locataires" class="text-center py-12">
      <p class="text-gray-600">Chargement des données en cours...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-8">
    <!-- Informations du Bailleur -->
    <section>
      <h2 class="text-sm font-semibold mb-6">Informations du Bailleur</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
        <div class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label for="bailleur-utilisateur" class="block text-xs mb-1 font-normal text-gray-900">
              Choisir utilisateur
              <span class="text-red-500">*</span>
            </label>
            <select 
              id="bailleur-utilisateur" 
              v-model="form.bailleurId"
              @change="loadBailleurInfo"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option v-for="user in bailleurs" :key="user.id" :value="user.id">
                {{ user.nom }} {{ user.prenom }}
              </option>
            </select>
          </div>
          
          <div>
            <label for="bailleur-nationalite" class="block text-xs mb-1 font-normal text-gray-900">Nationalité</label>
            <select 
              id="bailleur-nationalite" 
              v-model="form.bailleurNationalite"
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option>Congolaise</option>
              <option>Autre nationalité</option>
            </select>
          </div>
          
          <div>
            <label for="bailleur-numero-carte" class="block text-xs mb-1 font-normal text-gray-900">
              Numéro de la carte d'identité
              <span class="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="bailleur-numero-carte"
              v-model="form.bailleurNumeroPiece"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          
          <div>
            <label for="bailleur-type-carte" class="block text-xs mb-1 font-normal text-gray-900">
              Type de la carte d'identité
              <span class="text-red-500">*</span>
            </label>
            <select 
              id="bailleur-type-carte"
              v-model="form.bailleurTypePiece"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option>Carte d'électeur</option>
              <option>Passeport</option>
              <option>Carte consulaire</option>
              <option>Permis de conduire</option>
            </select>
          </div>
          
          <div>
            <label for="bailleur-numero-postal" class="block text-xs mb-1 font-normal text-gray-900">
              Numéro postal
              <span class="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="bailleur-numero-postal"
              v-model="form.bailleurNumeroPostal"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          
          <div>
            <label for="bailleur-province" class="block text-xs mb-1 font-normal text-gray-900">
              Province
              <span class="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="bailleur-province"
              v-model="form.bailleurProvince"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          
          <div>
            <label for="bailleur-quartier" class="block text-xs mb-1 font-normal text-gray-900">
              Quartier
              <span class="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="bailleur-quartier"
              v-model="form.bailleurQuartier"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          
          <div>
            <label for="bailleur-commune" class="block text-xs mb-1 font-normal text-gray-900">
              Commune
              <span class="text-red-500">*</span>
            </label>
            <select 
              id="bailleur-commune"
              v-model="form.bailleurCommune"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option>Barumbu</option>
              <option>Gombe</option>
              <option>Lingwala</option>
              <option>Kintambo</option>
              <option>Ngaliema</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Informations du Locataire -->
    <section>
      <h2 class="text-sm font-semibold mb-6">Informations du Locataire</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
        <div class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label for="locataire-utilisateur" class="block text-xs mb-1 font-normal text-gray-900">
              Choisir utilisateur
              <span class="text-red-500">*</span>
            </label>
            <select 
              id="locataire-utilisateur" 
              v-model="form.locataireId"
              @change="loadLocataireInfo"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option v-for="user in locataires" :key="user.id" :value="user.id">
                {{ user.nom }} {{ user.prenom }}
              </option>
            </select>
          </div>
          <div>
            <label for="locataire-nationalite" class="block text-xs mb-1 font-normal text-gray-900">Nationalité</label>
            <select id="locataire-nationalite" v-model="form.locataireNationalite" class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600">
              <option>Congolaise</option>
              <option>Autre nationalité</option>
            </select>
          </div>
          <div>
            <label for="locataire-numero-carte" class="block text-xs mb-1 font-normal text-gray-900">Numéro de la carte d'identité</label>
            <input type="text" id="locataire-numero-carte" v-model="form.locataireNumeroPiece" class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600" />
          </div>
          <div>
            <label for="locataire-type-carte" class="block text-xs mb-1 font-normal text-gray-900">Type de la carte d'identité</label>
            <select id="locataire-type-carte" v-model="form.locataireTypePiece" class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600">
              <option>Carte d'électeur</option>
              <option>Passeport</option>
              <option>Carte consulaire</option>
              <option>Permis de conduire</option>
            </select>
          </div>
          <div>
            <label for="locataire-numero-postal" class="block text-xs mb-1 font-normal text-gray-900">Numéro de postale</label>
            <input type="text" id="locataire-numero-postal" v-model="form.locataireNumeroPostal" class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600" />
          </div>
          <div>
            <label for="locataire-province" class="block text-xs mb-1 font-normal text-gray-900">Province</label>
            <input type="text" id="locataire-province" v-model="form.locataireProvince" class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600" />
          </div>
          <div>
            <label for="locataire-quartier" class="block text-xs mb-1 font-normal text-gray-900">Quartier</label>
            <input type="text" id="locataire-quartier" v-model="form.locataireQuartier" class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600" />
          </div>
          <div>
            <label for="locataire-commune" class="block text-xs mb-1 font-normal text-gray-900">Commune</label>
            <select id="locataire-commune" v-model="form.locataireCommune" class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600">
              <option>Barumbu</option>
              <option>Gombe</option>
              <option>Kinshasa</option>
              <option>Lingwala</option>
              <option>Autre</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    
    <!-- Clauses du contrat -->
    <section>
      <h2 class="text-sm font-semibold mb-6">Clauses du contrat</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
        <div class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label for="propriete" class="block text-xs mb-1 font-normal text-gray-900">
              Propriété
              <span class="text-red-500">*</span>
            </label>
            <select 
              id="propriete" 
              v-model="form.proprieteId"
              @change="loadProprieteInfo"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option v-for="propriete in proprietes" :key="propriete.id" :value="propriete.id">
                {{ propriete.nom || `Propriété #${propriete.id}` }}
              </option>
            </select>
          </div>
          <div>
            <label for="usage" class="block text-xs mb-1 font-normal text-gray-900">
              Usage
              <span class="text-red-500">*</span>
            </label>
            <select 
              id="usage" 
              v-model="form.usage"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="residentiel">Résidentiel</option>
              <option value="commercial">Commercial</option>
              <option value="bureau">Bureau</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label for="loyer" class="block text-xs mb-1 font-normal text-gray-900">
              Loyer
              <span class="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              id="loyer" 
              v-model.number="form.loyer"
              required
              min="0"
              step="0.01"
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <div>
            <label for="devise" class="block text-xs mb-1 font-normal text-gray-900">
              Devise
              <span class="text-red-500">*</span>
            </label>
            <select 
              id="devise" 
              v-model="form.devise"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="USD">USD</option>
              <option value="CDF">CDF</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label for="garantie" class="block text-xs mb-1 font-normal text-gray-900">
              Garantie
              <span class="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              id="garantie" 
              v-model.number="form.garantie"
              required
              min="0"
              step="0.01"
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <div>
            <label for="duree" class="block text-xs mb-1 font-normal text-gray-900">
              Durée
              <span class="text-red-500">*</span>
            </label>
            <select 
              id="duree" 
              v-model="form.duree"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="12">1 an</option>
              <option value="24">2 ans</option>
              <option value="36">3 ans</option>
              <option value="indeterminee">Indéterminée</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Buttons -->
    <div class="flex justify-center space-x-4 mt-6">
      <button 
        type="button" 
        @click="$emit('cancel')" 
        class="bg-red-400 hover:bg-red-500 text-white text-xs font-semibold rounded px-6 py-2 transition-colors"
      >
        Annuler
      </button>
      <button 
        type="submit" 
        :disabled="isLoading.submit"
        class="bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded px-6 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading.submit">Création en cours...</span>
        <span v-else>Créer contrat</span>
      </button>
    </div>
  </form>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { contractService } from '@/services/contractService';
import type { ContractStatus, User, Property, ContractFormData } from '@/types/contract';

// Types
type LoadingState = {
  bailleurs: boolean;
  locataires: boolean;
  proprietes: boolean;
  submission: boolean;
};

const router = useRouter();
const emit = defineEmits(['submitted', 'cancel']);

// États
// États de chargement
const isLoading = ref<LoadingState>({
  bailleurs: true,
  locataires: true,
  proprietes: false,
  submission: false
});

const error = ref<string | null>(null);

// Données du formulaire
const form = ref<ContractFormData>({
  // Informations du bailleur
  bailleurId: '',
  bailleurNationalite: 'Congolaise',
  bailleurTypePiece: 'carte_electeur',
  bailleurNumeroPiece: '',
  bailleurNumeroPostal: '',
  bailleurProvince: 'Kinshasa',
  bailleurQuartier: 'Beau vent',
  bailleurCommune: 'Barumbu',
  
  // Informations du locataire
  locataireId: '',
  locataireNationalite: 'Congolaise',
  locataireTypePiece: 'carte_electeur',
  locataireNumeroPiece: '',
  locataireNumeroPostal: '',
  locataireProvince: 'Kinshasa',
  locataireQuartier: 'Beau vent',
  locataireCommune: 'Barumbu',
  
  // Informations de la propriété
  proprieteId: '',
  usage: 'residentiel',
  loyer: '',
  devise: 'CDF',
  garantie: '',
  duree: 'Indéterminée',
  dateDebut: new Date().toISOString().split('T')[0],
  dateFin: '',
  statut: 'draft'
});

// Données initiales
const bailleurs = ref<User[]>([]);
const locataires = ref<User[]>([]);
const proprietes = ref<Property[]>([]);

// Charger les données initiales
onMounted(async () => {
  try {
    isLoading.value.bailleurs = true;
    
    // Charger en parallèle les bailleurs et locataires
    const [bailleursData, locatairesData] = await Promise.all([
      contractService.getBailleurs(),
      contractService.getLocataires()
    ]);
    
    bailleurs.value = bailleursData;
    locataires.value = locatairesData;
    
  } catch (err) {
    console.error('Erreur lors du chargement des données:', err);
    error.value = 'Impossible de charger les données nécessaires. Veuillez réessayer plus tard.';
  } finally {
    isLoading.value.bailleurs = false;
    isLoading.value.locataires = false;
  }
});

// Charger les informations du bailleur sélectionné
const loadBailleurInfo = async () => {
  const bailleurId = form.value.bailleurId;
  if (!bailleurId) return;
  
  try {
    isLoading.value.proprietes = true;
    error.value = null;
    
    // Trouver le bailleur sélectionné
    const bailleur = bailleurs.value.find(b => b.id.toString() === bailleurId.toString());
    if (!bailleur) {
      throw new Error('Bailleur non trouvé');
    }
    
    // Mettre à jour les champs du formulaire avec les données du bailleur
    form.value = {
      ...form.value,
      bailleurNationalite: bailleur.nationalite || 'Congolaise',
      bailleurTypePiece: bailleur.typePiece || 'carte_electeur',
      bailleurNumeroPiece: bailleur.numeroPiece || '',
      bailleurNumeroPostal: bailleur.adresse?.codePostal || '',
      bailleurProvince: bailleur.adresse?.province || '',
      bailleurQuartier: bailleur.adresse?.quartier || '',
      bailleurCommune: bailleur.adresse?.commune || 'Barumbu',
      // Réinitialiser les champs liés à la propriété
      proprieteId: '',
      usage: 'residentiel',
      loyer: '',
      garantie: ''
    };
    //il faut respecter la structure de la base de donnée et ajouté les information manquant dans le base de donnée si necessaire  et crée une migration
    
    // Charger les propriétés du bailleur
    const proprietesData = await contractService.getPropertiesByLandlord(bailleurId);
    proprietes.value = proprietesData;
    
  } catch (err) {
    console.error('Erreur lors du chargement des informations du bailleur:', err);
    error.value = 'Impossible de charger les propriétés de ce bailleur';
    proprietes.value = [];
  } finally {
    isLoading.value.proprietes = false;
  }
};

// Charger les informations du locataire sélectionné
const loadLocataireInfo = async () => {
  if (!form.value.locataireId) return;
  
  try {
    const locataire = locataires.value.find(l => l.id.toString() === form.value.locataireId.toString());
    if (!locataire) return;
    
    // Mettre à jour les champs du formulaire avec les données du locataire
    form.value = {
      ...form.value,
      locataireNationalite: locataire.nationalite || 'Congolaise',
      locataireTypePiece: locataire.typePiece || 'carte_electeur',
      locataireNumeroPiece: locataire.numeroPiece || '',
      locataireNumeroPostal: locataire.adresse?.codePostal || '',
      locataireProvince: locataire.adresse?.province || '',
      locataireQuartier: locataire.adresse?.quartier || '',
      locataireCommune: locataire.adresse?.commune || 'Barumbu'
    };
  } catch (error) {
    console.error('Erreur lors du chargement des informations du locataire:', error);
    error.value = 'Erreur lors du chargement des informations du locataire';
  }
};

// Charger les informations de la propriété sélectionnée
const loadProprieteInfo = async () => {
  if (!form.value.proprieteId) return;
  
  try {
    const propriete = proprietes.value.find(p => p.id.toString() === form.value.proprieteId.toString());
    if (!propriete) return;
    
    // Mettre à jour les champs du formulaire avec les données de la propriété
    const garantie = propriete.garantie || (propriete.loyer ? propriete.loyer * 3 : 0);
    form.value = {
      ...form.value,
      usage: propriete.usage || 'residentiel',
      loyer: propriete.loyer?.toString() || '',
      garantie: garantie.toString(),
      devise: 'USD' // Toujours définir l'USD comme devise par défaut
    };
    
  } catch (error) {
    console.error('Erreur lors du chargement des informations de la propriété:', error);
    error.value = 'Erreur lors du chargement des informations de la propriété';
  }
};

// Valider le formulaire avant soumission
const validateForm = (): boolean => {
  // Vérifier que tous les champs obligatoires sont remplis
  const requiredFields: Array<keyof ContractFormData> = [
    'bailleurId',
    'locataireId',
    'proprieteId',
    'loyer',
    'garantie',
    'dateDebut'
  ];
  
  for (const field of requiredFields) {
    const value = form.value[field];
    if (!value && value !== 0) {
      // Afficher une alerte pour l'utilisateur
      const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      alert(`Le champ ${fieldName} est requis`);
      return false;
    }
  }
  
  // Validation supplémentaire pour les montants
  if (isNaN(Number(form.value.loyer)) || Number(form.value.loyer) <= 0) {
    alert('Le loyer doit être un nombre positif');
    return false;
  }
  
  if (isNaN(Number(form.value.garantie)) || Number(form.value.garantie) <= 0) {
    alert('La garantie doit être un nombre positif');
    return false;
  }
  
  // Validation des dates
  const dateDebut = new Date(form.value.dateDebut);
  if (isNaN(dateDebut.getTime())) {
    alert('La date de début est invalide');
    return false;
  }
  
  if (form.value.dateFin) {
    const dateFin = new Date(form.value.dateFin);
    if (isNaN(dateFin.getTime()) || dateFin <= dateDebut) {
      alert('La date de fin doit être postérieure à la date de début');
      return false;
    }
  }
  
  return true;
};

// Gestion de la soumission du formulaire
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  try {
    isLoading.value.submission = true;
    error.value = null;
    
    // Préparer les données pour l'API
    const contractData = {
      ...form.value,
      // Convertir les chaînes en nombres pour les champs numériques
      loyer: Number(form.value.loyer),
      garantie: Number(form.value.garantie),
      // S'assurer que les dates sont au bon format
      dateDebut: new Date(form.value.dateDebut).toISOString(),
      dateFin: form.value.dateFin ? new Date(form.value.dateFin).toISOString() : null,
      // Définir le statut par défaut
      status: 'draft' as ContractStatus
    };
    
    // Appeler le service pour créer le contrat
    await contractService.createContract(contractData);
    
    // Rediriger vers la liste des contrats après création
    router.push('/tenant/contracts');
    
  } catch (err) {
    console.error('Erreur lors de la création du contrat:', err);
    error.value = 'Une erreur est survenue lors de la création du contrat. Veuillez réessayer.';
  } finally {
    isLoading.value.submission = false;
  }
};
</script>
