import { DirectiveBinding, ObjectDirective } from 'vue';

// Déclarer les propriétés personnalisées sur HTMLElement
// Extension de l'interface HTMLElement pour inclure nos propriétés personnalisées
declare global {
  interface HTMLElement {
    _tooltip?: HTMLDivElement;
    _showTooltip?: (e: MouseEvent) => void;
    _hideTooltip?: () => void;
  }
}

interface TooltipOptions {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  html?: boolean;
  theme?: string;
  offset?: [number, number];
}

const TooltipDirective: ObjectDirective<HTMLElement, string | TooltipOptions> = {
  mounted(el: HTMLElement & { _tooltipBinding?: any }, binding) {
    // Stocker la référence au binding pour y accérer plus tard
    el._tooltipBinding = binding;
    
    // Créer l'objet d'options avec des valeurs par défaut
    const bindingValue = binding.value || '';
    const defaultOptions: Partial<TooltipOptions> = {
      content: '',
      placement: 'right',
      html: false,
      theme: 'tooltip-theme',
      offset: [10, 10]
    };
    
    // Fusionner avec les options fournies
    const options: TooltipOptions = {
      ...defaultOptions,
      ...(typeof bindingValue === 'string' ? { content: bindingValue } : bindingValue)
    };

    // Ne rien faire si le contenu est vide
    if (!options.content) return;

    const tooltip = document.createElement('div');
    tooltip.className = `tooltip ${options.theme || 'tooltip-theme'}`;
    tooltip.innerHTML = options.html ? options.content : '';
    
    if (!options.html) {
      const text = document.createTextNode(options.content);
      tooltip.appendChild(text);
    }
    
    tooltip.style.position = 'fixed';
    tooltip.style.display = 'none';
    tooltip.style.zIndex = '9999';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.transition = 'opacity 0.2s ease-in-out';
    
    document.body.appendChild(tooltip);
    
    // Créer une flèche pour le tooltip
    const arrow = document.createElement('div');
    arrow.className = 'tooltip-arrow';
    tooltip.appendChild(arrow);
    
    // Créer des gestionnaires d'événements liés à l'élément
    const showHandler = showTooltip.bind(el);
    const hideHandler = hideTooltip.bind(el);
    
    // Stocker les références pour le nettoyage
    el._tooltip = tooltip;
    el._showTooltip = showHandler;
    el._hideTooltip = hideHandler;
    
    // Ajouter les écouteurs d'événements avec l'option passive pour de meilleures performances
    el.addEventListener('mouseenter', showHandler, { passive: true });
    el.addEventListener('mouseleave', hideHandler, { passive: true });
    el.addEventListener('click', hideHandler, { passive: true });
    
    // Gérer le cas où la souris est déjà sur l'élément au chargement
    if (el.matches(':hover')) {
      const rect = el.getBoundingClientRect();
      const fakeEvent = {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        preventDefault: () => {},
        stopPropagation: () => {}
      } as unknown as MouseEvent;
      showHandler(fakeEvent);
    }
  },
  
  updated(el, binding) {
    // Mettre à jour le contenu du tooltip si nécessaire
    const options: TooltipOptions = typeof binding.value === 'string' 
      ? { content: binding.value }
      : binding.value || { content: '' };
      
    if (el._tooltip) {
      if (options.html) {
        el._tooltip.innerHTML = options.content || '';
      } else {
        el._tooltip.textContent = options.content || '';
      }
      
      // Mettre à jour la classe du thème si nécessaire
      if (options.theme) {
        el._tooltip.className = `tooltip ${options.theme}`;
      }
    }
  },
  
  unmounted(el: HTMLElement & { _tooltipBinding?: any }) {
    try {
      // Nettoyer le tooltip s'il existe
      if (el._tooltip && el._tooltip.parentNode) {
        document.body.removeChild(el._tooltip);
      }
      
      // Supprimer les écouteurs d'événements
      if (el._showTooltip) {
        el.removeEventListener('mouseenter', el._showTooltip);
      }
      
      if (el._hideTooltip) {
        el.removeEventListener('mouseleave', el._hideTooltip);
        el.removeEventListener('click', el._hideTooltip);
      }
    } finally {
      // Nettoyer les références
      delete el._tooltip;
      delete el._showTooltip;
      delete el._hideTooltip;
      delete el._tooltipBinding;
    }
  }
};

function showTooltip(this: HTMLElement, e: MouseEvent) {
  const tooltip = this._tooltip;
  if (!tooltip) return;
  
  // Récupérer les options depuis le binding
  const binding = (this as any)._tooltipBinding as DirectiveBinding<TooltipOptions | string>;
  const bindingValue = binding.value || '';
  
  // Créer un objet d'options avec des valeurs par défaut
  const defaultOptions: Partial<TooltipOptions> = {
    content: '', // Contenu vide par défaut
    placement: 'right',
    html: false,
    offset: [10, 10]
  };
  
  // Fusionner avec les options fournies
  const mergedOptions: TooltipOptions = {
    ...defaultOptions,
    ...(typeof bindingValue === 'string' ? { content: bindingValue } : bindingValue)
  };
  
  // Extraire les options nécessaires
  const { content, html, placement, offset } = mergedOptions;

  // Mettre à jour le contenu si nécessaire
  if (content) {
    if (html) {
      tooltip.innerHTML = content;
    } else {
      tooltip.textContent = content;
    }
  }

  // Afficher le tooltip pour calculer ses dimensions
  tooltip.style.display = 'block';
  tooltip.style.opacity = '0';
  
  // Forcer le navigateur à recalculer le style et le layout
  tooltip.offsetHeight;
  
  const rect = tooltip.getBoundingClientRect();
  const tooltipWidth = rect.width;
  const tooltipHeight = rect.height;
  
  const x = e.clientX;
  const y = e.clientY;
  
  // Définir la position par défaut (en bas à droite du curseur)
  const offsetX = offset?.[0] || 10;
  const offsetY = offset?.[1] || 10;
  
  let posX = x + offsetX;
  let posY = y + offsetY;
  
  // Ajuster la position si nécessaire pour éviter le débordement
  if (posX + tooltipWidth > window.innerWidth) {
    posX = x - tooltipWidth - offsetX;
  }
  
  if (posY + tooltipHeight > window.innerHeight) {
    posY = y - tooltipHeight - offsetY;
  }
  
  // Appliquer la position
  tooltip.style.left = `${posX}px`;
  tooltip.style.top = `${posY}px`;
  
  // Afficher avec une transition
  // Utiliser setTimeout pour s'assurer que le navigateur a le temps de traiter le changement d'opacité
  setTimeout(() => {
    tooltip.style.opacity = '1';
  }, 10);
}

function hideTooltip(this: HTMLElement) {
  const tooltip = this._tooltip;
  if (!tooltip) return;
  
  // Masquer avec une transition
  tooltip.style.opacity = '0';
  
  // Nettoyer après l'animation
  setTimeout(() => {
    if (tooltip.style.opacity === '0') { // Vérifier que l'opacité est toujours à 0
      tooltip.style.display = 'none';
    }
  }, 200);
}

const tooltipDirective = TooltipDirective;

export default tooltipDirective;
