import type { DirectiveBinding, ObjectDirective } from 'vue';

type ClickOutsideElement = HTMLElement & {
  __clickOutsideHandler__: (event: MouseEvent) => void;
};

const clickOutsideDirective: ObjectDirective = {
  beforeMount(el: ClickOutsideElement, binding: DirectiveBinding) {
    // Vérifier que la valeur de la directive est une fonction
    if (typeof binding.value !== 'function') {
      const compName = binding.instance?.$options?.name || 'component';
      console.warn(`[v-click-outside] La fonction fournie à v-click-outside dans le composant ${compName} n'est pas valide.`);
      return;
    }

    // Créer le gestionnaire d'événement
    const clickOutsideHandler = (event: MouseEvent) => {
      // Vérifier si le clic est en dehors de l'élément
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };

    // Stocker la référence au gestionnaire pour pouvoir le supprimer plus tard
    el.__clickOutsideHandler__ = clickOutsideHandler;

    // Ajouter l'écouteur d'événement
    document.addEventListener('click', clickOutsideHandler);
  },
  
  unmounted(el: ClickOutsideElement) {
    // Nettoyer l'écouteur d'événement lorsque le composant est démonté
    if (el.__clickOutsideHandler__) {
      document.removeEventListener('click', el.__clickOutsideHandler__);
    }
  }
};

export default clickOutsideDirective;
