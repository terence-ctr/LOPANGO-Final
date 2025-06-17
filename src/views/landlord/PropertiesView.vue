<template>
  <div class="bg-white text-gray-900 min-h-screen p-6">
    <!-- En-tête -->
    <header class="flex justify-between items-center mb-8">
      <h1 class="text-xl font-extrabold leading-tight">
        Mes propriétés
      </h1>
      <div class="flex items-center space-x-4">
        <button aria-label="Notifications" class="text-gray-600 hover:text-gray-900 text-lg">
          <i class="far fa-bell"></i>
        </button>
        <img 
          alt="Avatar" 
          class="w-10 h-10 rounded-full object-cover" 
          src="https://storage.googleapis.com/a1aa/image/faf86708-0147-48e2-c0ad-8c003eda2a76.jpg"
        />
      </div>
    </header>

    <!-- Barre d'outils -->
    <section class="mb-4 flex flex-wrap gap-3 items-center">
      <button class="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100" type="button">
        <i class="fas fa-sliders-h text-xs"></i>
        <span>Filtrer</span>
        <i class="fas fa-chevron-down text-xs"></i>
      </button>
      <select aria-label="Colonnes" class="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100">
        <option>Colonnes</option>
      </select>
      <input 
        v-model="searchQuery"
        class="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600" 
        placeholder="Recherche..." 
        type="search"
      />
      <button 
        @click="openAddModal"
        class="ml-auto bg-blue-900 text-white rounded-md px-5 py-2 text-sm font-semibold hover:bg-blue-800" 
        type="button"
      >
        Ajouter une propriété
      </button>
    </section>

    <!-- Tableau des propriétés -->
    <section class="overflow-x-auto border border-gray-200 rounded-md">
      <table class="w-full text-left text-sm text-gray-600">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-3 px-4 font-semibold w-12">#</th>
            <th class="py-3 px-4 font-semibold">Nom de la propriété</th>
            <th class="py-3 px-4 font-semibold">Adresse</th>
            <th class="py-3 px-4 font-semibold">Ville</th>
            <th class="py-3 px-4 font-semibold">Code postal</th>
            <th class="py-3 px-4 font-semibold">Loyer</th>
            <th class="py-3 px-4 font-semibold">Statut</th>
            <th class="py-3 px-4 font-semibold w-10">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(property, index) in properties" :key="property.id" class="border-b border-gray-200 hover:bg-gray-50">
            <td class="py-3 px-4">{{ index + 1 }}</td>
            <td class="py-3 px-4 font-medium">{{ property.name }}</td>
            <td class="py-3 px-4">{{ property.address }}</td>
            <td class="py-3 px-4">{{ property.city }}</td>
            <td class="py-3 px-4">{{ property.postalCode }}</td>
            <td class="py-3 px-4">{{ property.rent }} €</td>
            <td class="py-3 px-4">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', property.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                {{ property.status }}
              </span>
            </td>
            <td class="py-3 px-4 text-center">
              <button 
                @click.stop="toggleMenu(property.id)" 
                class="text-gray-500 hover:text-gray-700"
                aria-label="Actions"
              >
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const searchQuery = ref('');
const activeMenu = ref<number | null>(null);

// Données de démonstration
const properties = ref([
  {
    id: 1,
    name: 'Appartement B20',
    address: '123 Rue de la Paix',
    city: 'Paris',
    postalCode: '75000',
    rent: 850,
    status: 'Actif'
  },
  {
    id: 2,
    name: 'Appartement B10',
    address: '456 Avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    rent: 1200,
    status: 'Inactif'
  }
]);

const toggleMenu = (id: number) => {
  activeMenu.value = activeMenu.value === id ? null : id;
};

const openAddModal = () => {
  // TODO: Implémenter l'ouverture du modal d'ajout
  console.log('Ouvrir le modal d\'ajout');
};
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>
       Nom
      </th>
      <th class="py-3 px-4 font-semibold min-w-[280px]">
       Adresse
      </th>
      <th class="py-3 px-4 font-semibold min-w-[140px]">
       Locataire
      </th>
      <th class="py-3 px-4 font-semibold w-20">
       Loyer mensuel
      </th>
      <th class="py-3 px-4 font-semibold w-20">
       Statut
      </th>
      <th class="py-3 px-4 font-semibold w-12">
      </th>
     </tr>
    </thead>
    <tbody>
     <tr class="border-b border-gray-100">
      <td class="py-3 px-4 font-normal">
       01
      </td>
      <td class="py-3 px-4 font-normal">
       Appartement B20
      </td>
      <td class="py-3 px-4 font-normal whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]">
       Luapula A16, C/Barumbu, Immeuble Dan
      </td>
      <td class="py-3 px-4 font-semibold text-blue-700 cursor-pointer hover:underline">
       Elie Oko
      </td>
      <td class="py-3 px-4 font-normal">
       400$
      </td>
      <td class="py-3 px-4 font-semibold text-green-600">
       Actif
      </td>
      <td class="py-3 px-4 relative text-center">
       <button aria-expanded="false" aria-haspopup="true" aria-label="Actions" class="text-gray-400 hover:text-gray-600 focus:outline-none" id="menu-btn-1" onclick="toggleMenu('menu-1')">
        <i class="fas fa-ellipsis-h">
        </i>
       </button>
       <div aria-labelledby="menu-btn-1" class="hidden absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg text-xs z-10" id="menu-1" role="menu">
        <button class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-gray-700" role="menuitem" onclick="openModal('modal-1')">
         <i class="fas fa-eye">
         </i>
         Voir détails
        </button>
        <button class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-gray-700" role="menuitem" onclick="openModal('modal-2')">
         <i class="fas fa-pen">
         </i>
         Éditer
        </button>
        <button class="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-500" role="menuitem" onclick="openModal('modal-3')">
         <i class="fas fa-trash-alt">
         </i>
         Supprimer
        </button>
       </div>
      </td>
     </tr>
     <tr>
      <td class="py-3 px-4 font-normal">
       02
      </td>
      <td class="py-3 px-4 font-normal">
       Appartement B20
      </td>
      <td class="py-3 px-4 font-normal whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]">
       Luapula A16, C/Kin, Immeuble Boketshu
      </td>
      <td class="py-3 px-4 font-semibold text-blue-700 cursor-pointer hover:underline">
       Meschack Kapanga
      </td>
      <td class="py-3 px-4 font-normal">
       350$
      </td>
      <td class="py-3 px-4 font-semibold text-green-600 flex items-center gap-1">
       <i class="fas fa-arrow-up text-green-600 text-[10px]">
       </i>
       A
      </td>
      <td class="py-3 px-4 relative text-center">
       <button aria-expanded="false" aria-haspopup="true" aria-label="Actions" class="text-gray-400 hover:text-gray-600 focus:outline-none" id="menu-btn-2" onclick="toggleMenu('menu-2')">
        <i class="fas fa-ellipsis-h">
        </i>
       </button>
       <div aria-labelledby="menu-btn-2" class="hidden absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg text-xs z-10" id="menu-2" role="menu">
        <button class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-gray-700" role="menuitem" onclick="openModal('modal-1')">
         <i class="fas fa-eye">
         </i>
         Voir détails
        </button>
        <button class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-gray-700" role="menuitem" onclick="openModal('modal-2')">
         <i class="fas fa-pen">
         </i>
         Éditer
        </button>
        <button class="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-500" role="menuitem" onclick="openModal('modal-3')">
         <i class="fas fa-trash-alt">
         </i>
         Supprimer
        </button>
       </div>
      </td>
     </tr>
    </tbody>
   </table>
  </section>

  <!-- Modal Overlay -->
  <div class="fixed inset-0 bg-black bg-opacity-50 hidden justify-center items-center z-50" id="modal-overlay">
   <!-- Modal Content -->
   <div class="bg-white rounded-lg max-w-md w-full p-6 relative">
    <button aria-label="Close modal" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onclick="closeModal()">
     <i class="fas fa-times text-lg">
     </i>
    </button>
    <div id="modal-content" class="text-gray-900 text-sm">
     <!-- Dynamic modal content will be inserted here -->
    </div>
   </div>
  </div>

 
</template>

<script>
function toggleMenu(id) {
   const menu = document.getElementById(id);
   if (menu.classList.contains('hidden')) {
     // Close any other open menus
     document.querySelectorAll('div[id^="menu-"]').forEach((el) => {
       el.classList.add('hidden');
     });
     menu.classList.remove('hidden');
   } else {
     menu.classList.add('hidden');
   }
 }
 // Close menus if clicked outside
 document.addEventListener('click', (e) => {
   if (
     !e.target.closest('button[aria-label="Actions"]') &&
     !e.target.closest('div[id^="menu-"]')
   ) {
     document.querySelectorAll('div[id^="menu-"]').forEach((el) => {
       el.classList.add('hidden');
     });
   }
 });

 // Modal functions
 function openModal(type) {
   const overlay = document.getElementById('modal-overlay');
   const content = document.getElementById('modal-content');
   let html = '';
   if (type === 'modal-1') {
     html = `
       <h2 class="text-lg font-semibold mb-4">Détails de la propriété</h2>
       <p>Voici les détails complets de la propriété sélectionnée.</p>
     `;
   } else if (type === 'modal-2') {
     html = `
       <h2 class="text-lg font-semibold mb-4">Éditer la propriété</h2>
       <form class="space-y-4 text-sm">
         <div>
           <label class="block mb-1 font-medium" for="nom">Nom</label>
           <input id="nom" type="text" class="w-full border border-gray-300 rounded px-3 py-2" value="Appartement B20"/>
         </div>
         <div>
           <label class="block mb-1 font-medium" for="adresse">Adresse</label>
           <input id="adresse" type="text" class="w-full border border-gray-300 rounded px-3 py-2" value="Luapula A16, C/Barumbu, Immeuble Dan"/>
         </div>
         <div>
           <label class="block mb-1 font-medium" for="locataire">Locataire</label>
           <input id="locataire" type="text" class="w-full border border-gray-300 rounded px-3 py-2" value="Elie Oko"/>
         </div>
         <div>
           <label class="block mb-1 font-medium" for="loyer">Loyer mensuel</label>
           <input id="loyer" type="text" class="w-full border border-gray-300 rounded px-3 py-2" value="400$"/>
         </div>
         <div>
           <label class="block mb-1 font-medium" for="statut">Statut</label>
           <select id="statut" class="w-full border border-gray-300 rounded px-3 py-2">
             <option selected>Actif</option>
             <option>Inactif</option>
           </select>
         </div>
         <div class="flex justify-end space-x-3">
           <button type="button" class="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100" onclick="closeModal()">Annuler</button>
           <button type="submit" class="px-4 py-2 rounded bg-blue-900 text-white hover:bg-blue-800">Enregistrer</button>
         </div>
       </form>
     `;
   } else if (type === 'modal-3') {
     html = `
       <h2 class="text-lg font-semibold mb-4 text-red-600">Supprimer la propriété</h2>
       <p>Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible.</p>
       <div class="mt-6 flex justify-end space-x-3">
         <button type="button" class="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100" onclick="closeModal()">Annuler</button>
         <button type="button" class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Supprimer</button>
       </div>
     `;
   }
   content.innerHTML = html;
   overlay.classList.remove('hidden');
   // Close all menus when modal opens
   document.querySelectorAll('div[id^="menu-"]').forEach((el) => {
     el.classList.add('hidden');
   });
 }

 function closeModal() {
   const overlay = document.getElementById('modal-overlay');
   overlay.classList.add('hidden');
 }
</script>