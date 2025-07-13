import { PluginOptions, POSITION, useToast } from 'vue-toastification';
import type { ToastOptions } from 'vue-toastification/dist/types/types';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const options: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__fade',
  maxToasts: 5,
  newestOnTop: true,
  filterBeforeCreate: (toast, toasts) => {
    if (toasts.filter(t => t.content === toast.content).length) {
      return false;
    }
    return toast;
  }
};

export { Toast, options };

// Fonction utilitaire pour afficher les erreurs
export const showError = (message: string) => {
  const toast = useToast();
  toast.error(message, {
    icon: 'error',
    toastClassName: 'error-toast',
  });
};

// Fonction utilitaire pour afficher les succès
export const showSuccess = (message: string) => {
  const toast = useToast();
  toast.success(message, {
    icon: 'check_circle',
    toastClassName: 'success-toast',
  });
};
