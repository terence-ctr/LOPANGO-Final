import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Clé pour le stockage local
const PROPERTY_TOKEN_KEY = 'lopango_property_token';

export const usePropertyStore = defineStore('property', () => {
  const propertyToken = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getPropertyToken = computed(() => propertyToken.value);
  const isLoading = computed(() => loading.value);
  const propertyError = computed(() => error.value);

  // Actions
  const setPropertyToken = (token: string | null) => {
    propertyToken.value = token;
    if (token) {
      localStorage.setItem(PROPERTY_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(PROPERTY_TOKEN_KEY);
    }
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  // Charger le token depuis le stockage local
  const loadStoredToken = () => {
    const storedToken = localStorage.getItem(PROPERTY_TOKEN_KEY);
    if (storedToken) {
      propertyToken.value = storedToken;
    }
  };

  // Nettoyer le token
  const clearPropertyToken = () => {
    propertyToken.value = null;
    localStorage.removeItem(PROPERTY_TOKEN_KEY);
  };

  // Initialiser le store
  if (typeof window !== 'undefined') {
    loadStoredToken();
  }

  return {
    propertyToken,
    getPropertyToken,
    isLoading,
    propertyError,
    setPropertyToken,
    setLoading,
    setError,
    clearError,
    clearPropertyToken,
    loadStoredToken
  };
});
