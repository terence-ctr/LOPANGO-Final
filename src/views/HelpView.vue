<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Centre d'aide</h1>
    </div>

    <!-- Barre de recherche -->
    <div class="mb-6">
      <div class="relative">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher dans l'aide..."
          class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-5 w-5 absolute right-3 top-2.5 text-gray-400"
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- Catégories d'aide -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        v-for="category in categories"
        :key="category.id"
        class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
          <component :is="category.icon" class="h-6 w-6" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ category.title }}</h3>
        <p class="text-gray-600 mb-4">{{ category.description }}</p>
        <button 
          @click="showArticles(category.id)"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Voir les articles
        </button>
      </div>
    </div>

    <!-- Articles -->
    <div v-if="selectedCategory" class="mt-8">
      <h2 class="text-xl font-bold mb-4">Articles de la catégorie {{ selectedCategory.title }}</h2>
      <div class="space-y-4">
        <div 
          v-for="article in articles"
          :key="article.id"
          class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
        >
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ article.title }}</h3>
          <p class="text-gray-600 mb-4">{{ article.excerpt }}</p>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">{{ formatDate(article.date) }}</span>
            <button 
              @click="viewArticle(article.id)"
              class="text-blue-600 hover:text-blue-700"
            >
              Lire l'article
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Support -->
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">Besoin d'aide ?</h2>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Contactez le support</h3>
          <p class="text-gray-600 mb-4">Notre équipe de support est là pour vous aider.</p>
          <button 
            @click="openSupportChat"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Démarrer une conversation
          </button>
        </div>
        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Numéro d'urgence</h3>
          <p class="text-gray-600 mb-4">Pour les problèmes critiques</p>
          <a 
            href="tel:+33123456789"
            class="text-blue-600 hover:text-blue-700"
          >
            +33 1 23 45 67 89
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Données de recherche
const searchQuery = ref('');

// Catégories d'aide
const categories = ref([
  {
    id: 1,
    title: 'Comptabilité',
    description: 'Tout sur la gestion des paiements et les taxes',
    icon: 'svg-calculator'
  },
  {
    id: 2,
    title: 'Gestion locative',
    description: 'Contrats, locataires et propriétés',
    icon: 'svg-home'
  },
  {
    id: 3,
    title: 'Maintenance',
    description: 'Guide pour la maintenance des biens',
    icon: 'svg-wrench'
  }
]);

// Articles sélectionnés
const selectedCategory = ref(null);
const articles = ref([
  {
    id: 1,
    title: 'Comment gérer les paiements en retard',
    excerpt: 'Découvrez les meilleures pratiques pour gérer les paiements en retard',
    date: new Date('2024-02-01')
  },
  {
    id: 2,
    title: 'Guide complet des taxes immobilières',
    excerpt: 'Tout savoir sur les taxes immobilières en France',
    date: new Date('2024-01-15')
  }
]);

// Hooks pour les icônes SVG
const svgCalculator = () => <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
</svg>;

const svgHome = () => <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
</svg>;

const svgWrench = () => <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37.996.608 2.296.07 2.572-1.065z" />
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>;

// Méthodes
const showArticles = (categoryId: number) => {
  // Logique pour afficher les articles de la catégorie
  console.log('Afficher les articles de la catégorie:', categoryId);
};

const viewArticle = (articleId: number) => {
  // Logique pour afficher un article
  console.log('Afficher l'article:', articleId);
};

const openSupportChat = () => {
  // Logique pour ouvrir le chat support
  console.log('Ouvrir le chat support');
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};
</script>
