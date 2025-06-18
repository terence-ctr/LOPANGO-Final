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

    <section class="overflow-x-auto border border-gray-200 rounded-md">
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

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import PropertyForm from '@/components/landlord/properties/PropertyForm.vue';

export default {
  components: {
    PropertyForm
  },
  setup() {
    const search = ref("");
    const openMenuId = ref(null);
    const modalVisible = ref(false);
    const modalType = ref(null);
    const isAddPropertyModalOpen = ref(false);
    const propertyData = ref({
      name: '',
      type: 'T2',
      area: '',
      rooms: 1,
      bathrooms: 1,
      floor: '',
      furnished: 'Non',
      equipment: '',
      rent: '',
      charges: '',
      status: 'Actif',
      address: ''
    });

    const openAddPropertyModal = () => {
      // Réinitialiser les données du formulaire
      propertyData.value = {
        name: '',
        type: 'T2',
        area: '',
        rooms: 1,
        bathrooms: 1,
        floor: '',
        furnished: 'Non',
        equipment: '',
        rent: '',
        charges: '',
        status: 'Actif',
        address: ''
      };
      isAddPropertyModalOpen.value = true;
    };

    const handleSubmit = (property) => {
      console.log('Nouvelle propriété:', property);
      // Ici, vous pourriez ajouter la logique pour sauvegarder la propriété
      isAddPropertyModalOpen.value = false;
      // Recharger la liste des propriétés ou ajouter à la liste existante
    };

    const handleCancel = () => {
      isAddPropertyModalOpen.value = false;
    };
    const modalData = reactive({
      id: null,
      nom: "",
      adresse: "",
      locataire: "",
      loyer: "",
      statut: "",
    });

    const editForm = reactive({
      id: null,
      nom: "",
      adresse: "",
      locataire: "",
      loyer: "",
      statut: "Actif",
    });

    const properties = ref([
      {
        id: "01",
        nom: "Appartement B20",
        adresse: "Luapula A16, C/Barumbu, Immeuble Dan",
        locataire: "Elie Oko",
        loyer: "400$",
        statut: "Actif",
      },
      {
        id: "02",
        nom: "Appartement B20",
        adresse: "Luapula A16, C/Kin, Immeuble Boketshu",
        locataire: "Meschack Kapanga",
        loyer: "350$",
        statut: "Actif",
      },
    ]);

    const filteredProperties = computed(() => {
      if (!search.value) return properties.value;
      return properties.value.filter((p) =>
        [p.id, p.nom, p.adresse, p.locataire, p.loyer, p.statut]
          .join(" ")
          .toLowerCase()
          .includes(search.value.toLowerCase())
      );
    });

    function toggleMenu(id) {
      if (openMenuId.value === id) {
        openMenuId.value = null;
      } else {
        openMenuId.value = id;
      }
    }

    function openModal(type, property) {
      modalType.value = type;
      modalVisible.value = true;
      openMenuId.value = null;

      if (type === "details") {
        Object.assign(modalData, property);
      } else if (type === "edit") {
        Object.assign(editForm, property);
      } else if (type === "delete") {
        Object.assign(modalData, property);
      }
    }

    function closeModal() {
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
      Object.assign(editForm, {
        id: null,
        nom: "",
        adresse: "",
        locataire: "",
        loyer: "",
        statut: "Actif",
      });
    }

    function saveEdit() {
      const index = properties.value.findIndex((p) => p.id === editForm.id);
      if (index !== -1) {
        properties.value[index] = { ...editForm };
      }
      closeModal();
    }

    function confirmDelete() {
      properties.value = properties.value.filter((p) => p.id !== modalData.id);
      closeModal();
    }

    onMounted(() => {
      document.addEventListener("click", (e) => {
        if (
          !e.target.closest("button[aria-label='Actions']") &&
          !e.target.closest("div[role='menu']")
        ) {
          openMenuId.value = null;
        }
      });
    });

    return {
      search,
      openMenuId,
      toggleMenu,
      properties,
      filteredProperties,
      modalVisible,
      modalType,
      modalData,
      editForm,
      openModal,
      closeModal,
      saveEdit,
      // Propriétés et méthodes pour le formulaire
      isAddPropertyModalOpen,
      propertyData,
      openAddPropertyModal,
      handleSubmit,
      handleCancel
    };
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

body {
  font-family: "Inter", sans-serif;
}
</style>