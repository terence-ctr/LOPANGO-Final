import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePropertyStore } from './propertyStore';

export type AlertType = 'error' | 'warning' | 'success' | 'info' | 'payment_confirmation' | 'maintenance_request' | 'contract_ending' | 'other';

export interface AlertAction {
  label: string;
  handler: () => void;
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  userId?: string;
  propertyId?: string;
  data?: any;
  action?: AlertAction;
  createdAt?: string;
  autoClose?: boolean;
}

export interface LandlordAlert extends Alert {
  requiresAction: boolean;
  actionTaken?: boolean;
  actionLabel?: string;
  propertyId?: string;
  data?: any;
}

type AlertInput = Omit<Alert, 'id' | 'timestamp' | 'read'> & {
  requiresAction?: boolean;
  actionTaken?: boolean;
  actionLabel?: string;
  autoClose?: boolean;
  createdAt?: string;
  propertyId?: string;
  data?: any;
};

export const useAlertStore = defineStore('alert', () => {
  const authStore = useAuthStore();
  const propertyStore = usePropertyStore();
  
  // Alertes génériques (pour tous les utilisateurs)
  const alerts = ref<Alert[]>([]);
  // Alertes spécifiques aux propriétaires
  const landlordAlerts = ref<LandlordAlert[]>([]);
  
  // Compteur d'alertes non lues pour le badge
  const unreadCount = computed(() => {
    const userAlerts = alerts.value.filter(alert => 
      !alert.read && (!alert.userId || alert.userId === authStore.user?._id)
    );
    
    const userLandlordAlerts = (authStore.user?.userType === 'landlord') 
      ? landlordAlerts.value.filter((alert: LandlordAlert) => 
          !alert.read && 
          (!alert.userId || alert.userId === authStore.user?._id) &&
          (!alert.propertyId || propertyStore.userProperties.some((p: any) => p.id === alert.propertyId))
        )
      : [];
    
    return userAlerts.length + userLandlordAlerts.length;
  });
  
  // Alertes de l'utilisateur courant
  const userAlerts = computed(() => {
    const authStore = useAuthStore();
    if (!authStore.user) return [];
    
    return alerts.value.filter(alert => 
      alert.userId === authStore.user?._id || !alert.userId
    );
  });
  
  // Alertes du propriétaire pour ses propriétés
  const userLandlordAlerts = computed(() => {
    const authStore = useAuthStore();
    const propertyStore = usePropertyStore();
    
    if (!authStore.user || authStore.user.userType !== 'landlord') return [];
    
    // Récupérer les IDs des propriétés du propriétaire
    const userPropertyIds = propertyStore.userProperties.map((p: any) => p._id);
    
    return alerts.value.filter(alert => 
      (alert.userId === authStore.user?._id || 
       (alert.propertyId && userPropertyIds.includes(alert.propertyId)) ||
       !alert.userId) &&
      (alert as any).requiresAction === true
    ) as LandlordAlert[];
  });
  
  // Ajouter une alerte générique
  const addAlert = (alert: AlertInput) => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
      ...alert,
      userId: alert.userId || authStore.user?._id
    };
    
    alerts.value.unshift(newAlert);
    
    // Supprimer automatiquement après la durée spécifiée
    if (newAlert.action && typeof newAlert.action.handler === 'function') {
      setTimeout(() => {
        removeAlert(newAlert.id);
      }, 5000); // Durée par défaut de 5 secondes
    }
    
    return newAlert.id;
  }
  
  // Ajouter une alerte pour propriétaire
  const addLandlordAlert = (alert: AlertInput) => {
    const newAlert: LandlordAlert = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
      ...alert,
      userId: alert.userId || authStore.user?._id,
      requiresAction: alert.requiresAction ?? false
    };
    
    landlordAlerts.value.unshift(newAlert);
    return newAlert.id;
  }
  
  // Marquer une alerte comme lue
  const markAsRead = (alertId: string) => {
    const alert = alerts.value.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
    }
  };

  const markAllAsRead = () => {
    alerts.value.forEach(alert => {
      alert.read = true;
    });
  }
  
  // Supprimer une alerte
  function removeAlert(alertId: string, isLandlordAlert = false) {
    const alertArray = isLandlordAlert ? landlordAlerts : alerts;
    const index = alertArray.value.findIndex(a => a.id === alertId);
    if (index !== -1) {
      alertArray.value.splice(index, 1);
    }
  }
  
  // Supprimer toutes les alertes lues
  function clearReadAlerts(isLandlordAlert = false) {
    const alertArray = isLandlordAlert ? landlordAlerts : alerts;
    alertArray.value = alertArray.value.filter(alert => !alert.read);
  }
  
  // Exécuter une action sur une alerte de propriétaire
  function executeAlertAction(alertId: string) {
    const alert = landlordAlerts.value.find(a => a.id === alertId);
    if (alert && alert.requiresAction && !alert.actionTaken && typeof alert.actionLabel === 'function') {
      (alert.actionLabel as any)();
      alert.actionTaken = true;
      
      // Mettre à jour l'alerte pour refléter l'action
      const index = landlordAlerts.value.findIndex(a => a.id === alertId);
      if (index !== -1) {
        landlordAlerts.value[index] = { ...alert };
      }
    }
  }
  
  // Méthodes utilitaires pour les types d'alertes courants
  const success = (message: string, options: Omit<AlertInput, 'type' | 'message' | 'title'> = {}) => {
    addAlert({
      type: 'success',
      title: 'Succès',
      message,
      autoClose: true,
      ...options
    });
  };

  const error = (message: string, options: Omit<AlertInput, 'type' | 'message' | 'title'> = {}) => {
    addAlert({
      type: 'error',
      title: 'Erreur',
      message,
      autoClose: true,
      ...options
    });
  };

  const warning = (message: string, options: Omit<AlertInput, 'type' | 'message' | 'title'> = {}) => {
    addAlert({
      type: 'warning',
      title: 'Avertissement',
      message,
      autoClose: true,
      ...options
    });
  };

  const info = (message: string, options: Omit<AlertInput, 'type' | 'message' | 'title'> = {}) => {
    addAlert({
      type: 'info',
      title: 'Information',
      message,
      autoClose: true,
      ...options
    });
  };

  return {
    // State
    alerts,
    landlordAlerts,
    
    // Getters
    unreadCount,
    userAlerts,
    userLandlordAlerts,
    
    // Actions
    addAlert,
    addLandlordAlert,
    markAsRead,
    markAllAsRead,
    removeAlert,
    clearReadAlerts,
    executeAlertAction,
    
    // Méthodes utilitaires
    success,
    error,
    warning,
    info
  };
});

export default useAlertStore;
