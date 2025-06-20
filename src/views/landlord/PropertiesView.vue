<template>
  <div class="bg-white text-gray-900 min-h-screen p-6">
    <section class="mb-4 flex flex-wrap gap-3 items-center">
      <button
        class="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
        type="button"
      >
        <i class="fas fa-sliders-h text-xs"></i>
        <span>Filter</span>
        <i class="fas fa-chevron-down text-xs"></i>
      </button>
      <select
        aria-label="Colonnes"
        class="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
      >
        <option>Colonnes</option>
      </select>
      <input
        v-model="search"
        class="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
        placeholder="Recherche..."
        type="search"
      />

      <button
        @click="openAddPropertyModal"
        class="ml-auto bg-blue-900 text-white rounded-md px-5 py-2 text-sm font-semibold hover:bg-blue-800"
        type="button"
      >
        Ajouter
      </button>
    </section>

    <!-- Modal d'ajout de propriété -->
    <div v-if="isAddPropertyModalOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-h-[90vh] w-full max-w-xl mx-4 overflow-y-auto shadow-xl">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Ajouter une propriété</h2>
            <button @click="isAddPropertyModalOpen = false" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <PropertyForm
            :property="propertyData"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>

    <section class="border border-gray-200 rounded-md overflow-hidden">
      <!-- Message quand il n'y a pas de propriétés -->
      <div v-if="properties.length === 0" class="p-8 text-center text-gray-500">
        <div class="mx-auto w-16 h-16 mb-4 text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-700">Aucune propriété trouvée</h3>
        <p class="mt-1 text-sm">Commencez par ajouter votre première propriété</p>
        <button
          @click="openAddPropertyModal"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i class="fas fa-plus mr-2"></i>
          Ajouter une propriété
        </button>
      </div>

      <!-- Tableau des propriétés -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-600">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="py-3 px-4 font-semibold w-12">#</th>
              <th class="py-3 px-4 font-semibold min-w-[120px]">Nom</th>
              <th class="py-3 px-4 font-semibold min-w-[280px]">Adresse</th>
              <th class="py-3 px-4 font-semibold min-w-[140px]">Locataire</th>
              <th class="py-3 px-4 font-semibold w-20">Loyer mensuel</th>
              <th class="py-3 px-4 font-semibold w-20">Statut</th>
              <th class="py-3 px-4 font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(property, index) in filteredProperties"
              :key="property.id"
              class="border-b border-gray-100"
            >
              <td class="py-3 px-4 font-normal">{{ property.id }}</td>
              <td class="py-3 px-4 font-normal">{{ property.nom }}</td>
              <td
                class="py-3 px-4 font-normal whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]"
                :title="property.adresse"
              >
                {{ property.adresse }}
              </td>
              <td
                class="py-3 px-4 font-semibold text-blue-700 cursor-pointer hover:underline"
              >
                {{ property.locataire }}
              </td>
              <td class="py-3 px-4 font-normal">{{ property.loyer }}</td>
              <td
                class="py-3 px-4 font-semibold flex items-center gap-1"
                :class="property.statut === 'Actif' ? 'text-green-600' : 'text-gray-600'"
              >
                <template v-if="property.statut === 'Actif'">
                  <i class="fas fa-arrow-up text-green-600 text-[10px]"></i>
                </template>
                {{ property.statut }}
              </td>
              <td class="py-3 px-4 relative text-center">
                <button
                  aria-expanded="false"
                  aria-haspopup="true"
                  aria-label="Actions"
                  class="text-gray-400 hover:text-gray-600 focus:outline-none"
                  @click="toggleMenu(property.id)"
                >
                  <i class="fas fa-ellipsis-h"></i>
                </button>
                <div
                  v-if="openMenuId === property.id"
                  class="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-md shadow-lg text-xs z-10"
                  role="menu"
                >
                  <button
                    class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-gray-700"
                    role="menuitem"
                    @click="openModal('details', property)"
                  >
                    <i class="fas fa-eye"></i> Voir détails
                  </button>
                  <button
                    class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-gray-700"
                    role="menuitem"
                    @click="openModal('edit', property)"
                  >
                    <i class="fas fa-pen"></i> Éditer
                  </button>
                  <button
                    class="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-500"
                    role="menuitem"
                    @click="openModal('delete', property)"
                  >
                    <i class="fas fa-trash-alt"></i> Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal Overlay -->
    <div
      v-if="modalVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          aria-label="Close modal"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          @click="closeModal"
        >
          <i class="fas fa-times text-lg"></i>
        </button>

        <template v-if="modalType === 'details'">
          <h2 class="text-lg font-semibold mb-4">Détails de la propriété</h2>
          <p><strong>Nom:</strong> {{ modalData.nom }}</p>
          <p><strong>Adresse:</strong> {{ modalData.adresse }}</p>
          <p><strong>Locataire:</strong> {{ modalData.locataire }}</p>
          <p><strong>Loyer mensuel:</strong> {{ modalData.loyer }}</p>
          <p><strong>Statut:</strong> {{ modalData.statut }}</p>
        </template>

        <template v-else-if="modalType === 'edit'">
          <h2 class="text-lg font-semibold mb-4">Éditer la propriété</h2>
          <form @submit.prevent="saveEdit" class="space-y-4 text-sm">
            <div>
              <label class="block mb-1 font-medium" for="nom">Nom</label>
              <input
                id="nom"
                v-model="editForm.nom"
                type="text"
                class="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label class="block mb-1 font-medium" for="adresse">Adresse</label>
              <input
                id="adresse"
                v-model="editForm.adresse"
                type="text"
                class="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label class="block mb-1 font-medium" for="locataire">Locataire</label>
              <input
                id="locataire"
                v-model="editForm.locataire"
                type="text"
                class="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label class="block mb-1 font-medium" for="loyer">Loyer mensuel</label>
              <input
                id="loyer"
                v-model="editForm.loyer"
                type="text"
                class="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label class="block mb-1 font-medium" for="statut">Statut</label>
              <select
                id="statut"
                v-model="editForm.statut"
                class="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option>Actif</option>
                <option>Inactif</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                class="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                @click="closeModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 rounded bg-blue-900 text-white hover:bg-blue-800"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </template>

        <template v-else-if="modalType === 'delete'">
          <h2 class="text-lg font-semibold mb-4 text-red-600">
            Supprimer la propriété
          </h2>
          <p>
            Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est
            irréversible.
          </p>
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              class="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              @click="closeModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              @click="confirmDelete"
            >
              Supprimer
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import type { ToastOptions } from 'vue-toastification';
import PropertyForm from '@/components/landlord/properties/PropertyForm.vue';
import type { PropertyFormData } from '@/types/property';
import PropertyService from '@/services/propertyService';

// Définition des types
type PropertyStatus = 'DISPONIBLE' | 'LOUE' | 'EN_ENTRETIEN' | 'INDISPONIBLE' | 'BROUILLON';

interface Property {
  id: string | number;
  title: string;
  fullAddress?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  tenant_id?: string | number | null;
  rent?: number;
  currency?: string;
  status: PropertyStatus;
  [key: string]: any; // Pour les propriétés supplémentaires
}

interface PropertyTableItem {
  id: string | number;
  nom: string;
  adresse: string;
  locataire: string;
  loyer: string;
  statut: string;
  [key: string]: any; // Pour les propriétés supplémentaires
}

// Références réactives
const router = useRouter();
const toast = useToast();

// État du composant
const search = ref<string>("");
const openMenuId = ref<string | null>(null);
const modalVisible = ref<boolean>(false);
const modalType = ref<'details' | 'edit' | 'delete' | null>(null);
const isAddPropertyModalOpen = ref<boolean>(false);
const properties = ref<PropertyTableItem[]>([]);

// Données du formulaire
const propertyData = reactive<Partial<PropertyFormData>>({
  title: '',
  type: 'T1',
  area: 0,
  rooms: 1,
  bathrooms: 1,
  floor: '0',
  furnished: false,
  equipment: [],
  rent: 0,
  charges: 0,
  status: 'DISPONIBLE',
  street: '',
  city: '',
  postalCode: '',
  country: 'France',
  fullAddress: '',
  currency: 'EUR',
  isFeatured: false
});

// Données de la modale
const modalData = reactive({
  id: null as string | number | null,
  nom: "",
  adresse: "",
  locataire: "",
  loyer: "",
  statut: "",
});

// Données du formulaire d'édition
const editForm = reactive({
  id: null as string | number | null,
  nom: "",
  adresse: "",
  locataire: "",
  loyer: "",
  statut: "Actif",
});

// Propriétés calculées
const filteredProperties = computed<PropertyTableItem[]>(() => {
  if (!search.value) return properties.value;
  return properties.value.filter((p) =>
    [p.id, p.nom, p.adresse, p.locataire, p.loyer, p.statut]
      .join(" ")
      .toLowerCase()
      .includes(search.value.toLowerCase())
  );
});

// Méthodes
const openAddPropertyModal = () => {
  // Réinitialiser les données du formulaire
  Object.assign(propertyData, {
    title: '',
    type: 'T1',
    area: 0,
    rooms: 1,
    bathrooms: 1,
    floor: '0',
    furnished: false,
    equipment: [],
    rent: 0,
    charges: 0,
    status: 'DISPONIBLE',
    street: '',
    city: '',
    postalCode: '',
    country: 'France',
    fullAddress: '',
    currency: 'EUR',
    isFeatured: false
  });
  isAddPropertyModalOpen.value = true;
};

const handleSubmit = async (property: PropertyFormData) => {
  try {
    // Afficher un message de chargement
    const loadingToast = toast.info('Création de la propriété en cours...', { timeout: false } as ToastOptions);
    
    // Appeler le service pour créer la propriété
    const newProperty = await PropertyService.createProperty(property);
    
    // Fermer le message de chargement
    toast.dismiss(loadingToast);
    
    // Afficher un message de succès
    toast.success('Propriété créée avec succès !');
    
    // Fermer la modale
    isAddPropertyModalOpen.value = false;
    
    // Recharger la liste des propriétés
    await loadProperties();
    
    // Rediriger vers la page de détail de la propriété
    router.push(`/landlord/properties/${newProperty.id}`);
  } catch (error) {
    console.error('Erreur lors de la création de la propriété:', error);
    
    // Afficher un message d'erreur
    toast.error('Une erreur est survenue lors de la création de la propriété');
  }
};

const handleCancel = () => {
  isAddPropertyModalOpen.value = false;
};

const loadProperties = async () => {
  try {
    const data = await PropertyService.getProperties() as Property[];
    // Formater les données pour correspondre au format attendu par le template
    properties.value = data.map((property: Property): PropertyTableItem => ({
      id: property.id,
      nom: property.title,
      adresse: property.fullAddress || `${property.street || ''}, ${property.postalCode || ''} ${property.city || ''}`.trim(),
      locataire: property.tenant_id ? 'À définir' : 'Aucun',
      loyer: `${property.rent || 0} ${property.currency || 'EUR'}`,
      statut: property.status === 'DISPONIBLE' ? 'Disponible' : 
             property.status === 'LOUE' ? 'Loué' :
             property.status === 'EN_ENTRETIEN' ? 'En entretien' :
             property.status === 'INDISPONIBLE' ? 'Indisponible' : 'Brouillon',
      ...property
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des propriétés:', error);
    toast.error('Impossible de charger la liste des propriétés');
  }
};

const toggleMenu = (id: string) => {
  if (openMenuId.value === id) {
    openMenuId.value = null;
  } else {
    openMenuId.value = id;
  }
};

const openModal = (type: 'details' | 'edit' | 'delete', property: PropertyTableItem) => {
  modalType.value = type;
  modalVisible.value = true;
  openMenuId.value = null;

  if (type === "details") {
    Object.assign(modalData, property);
  } else if (type === "edit") {
    // Convertir les données du tableau au format du formulaire
    Object.assign(editForm, {
      id: property.id,
      nom: property.nom,
      adresse: property.adresse,
      locataire: property.locataire,
      loyer: property.loyer,
      statut: property.statut
    });
  } else if (type === "delete") {
    Object.assign(modalData, property);
  }
};

const closeModal = () => {
  modalVisible.value = false;
  modalType.value = null;
  // Clear modal data
  Object.assign(modalData, {
    id: null,
    nom: "",
    adresse: "",
    locataire: "",
    loyer: "",
    statut: "",
  });
};

// Charger les propriétés au montage du composant
onMounted(() => {
  loadProperties();
});

// Fonction pour sauvegarder les modifications
const saveEdit = () => {
  const index = properties.value.findIndex((p) => p.id === editForm.id);
  if (index !== -1) {
    properties.value[index] = { ...editForm };
  }
  closeModal();
};

// Fonction pour confirmer la suppression
const confirmDelete = () => {
  properties.value = properties.value.filter((p) => p.id !== modalData.id);
  closeModal();
};

// Ajouter un événement pour fermer les menus contextuels lors d'un clic en dehors
onMounted(() => {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest("button[aria-label='Actions']") &&
      !target.closest("div[role='menu']")
    ) {
      openMenuId.value = null;
    }
  });
});

// Exposer les propriétés et méthodes au template
defineExpose({
  search,
  openMenuId,
  modalVisible,
  modalType,
  isAddPropertyModalOpen,
  properties: filteredProperties,
  modalData,
  editForm,
  openAddPropertyModal,
  handleSubmit,
  handleCancel,
  toggleMenu,
  openModal,
  closeModal,
  saveEdit,
  confirmDelete,
  loadProperties,
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

body {
  font-family: "Inter", sans-serif;
}
</style>