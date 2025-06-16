import { ref, watch } from 'vue';
import { persistenceService } from '@/services/persistence.service';

/**
 * Hook pour gérer un état persistant dans le localStorage
 * @param key Clé unique pour le stockage
 * @param initialValue Valeur initiale si aucune donnée n'est trouvée
 * @param options Options de configuration
 * @returns Un objet réactif avec la valeur et la fonction de mise à jour
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  options: { expiresIn?: number } = {}
) {
  // Récupérer les données sauvegardées ou utiliser la valeur initiale
  const storedValue = persistenceService.get<T>(key);
  const state = ref<T>(storedValue !== null ? storedValue : initialValue);

  // Sauvegarder automatiquement lorsque la valeur change
  watch(
    () => state.value,
    (newValue) => {
      persistenceService.set(key, newValue, options.expiresIn);
    },
    { deep: true }
  );

  // Fonction pour effacer la valeur stockée
  const clear = () => {
    persistenceService.remove(key);
    state.value = initialValue;
  };

  return {
    state,
    clear
  };
}

/**
 * Hook pour gérer un état de formulaire persistant
 * @param formKey Clé de base pour le stockage
 * @param initialValues Valeurs initiales du formulaire
 * @param options Options de configuration
 * @returns Un objet avec les champs du formulaire et des méthodes utilitaires
 */
export function usePersistentForm<T extends Record<string, any>>(
  formKey: string,
  initialValues: T,
  options: { expiresIn?: number } = {}
) {
  const form = usePersistentState<T>(formKey, initialValues, options);

  // Fonction pour réinitialiser le formulaire aux valeurs initiales
  const resetForm = () => {
    form.state.value = { ...initialValues };
  };

  // Fonction pour effacer le formulaire du stockage
  const clearForm = () => {
    form.clear();
    resetForm();
  };

  // Fonction pour mettre à jour un champ spécifique
  const setFieldValue = <K extends keyof T>(field: K, value: T[K]) => {
    form.state.value = {
      ...form.state.value,
      [field]: value
    };
  };

  return {
    form: form.state,
    setFieldValue,
    resetForm,
    clearForm
  };
}
