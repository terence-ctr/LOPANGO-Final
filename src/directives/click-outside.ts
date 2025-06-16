import { DirectiveBinding } from 'vue';

/**
 * Directive personnalisée pour détecter les clics en dehors d'un élément
 * Utilisation : v-click-outside="maMethode"
 */
const ClickOutside = {
  beforeMount(el: HTMLElement, binding: DirectiveBinding) {
    // Stocker la fonction de rappel dans un attribut de l'élément
    el._clickOutside = (event: MouseEvent) => {
      // Vérifier si le clic est en dehors de l'élément
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    
    // Ajouter l'écouteur d'événement
    document.addEventListener('click', el._clickOutside);
  },
  
  unmounted(el: HTMLElement) {
    // Nettoyer l'écouteur d'événement lors du démontage du composant
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside);
      delete el._clickOutside;
    }
  },
} as any;

export default ClickOutside;
