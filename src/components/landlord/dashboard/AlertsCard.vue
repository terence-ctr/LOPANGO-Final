<template>
  <div class="bg-white rounded-xl shadow-md p-6 h-full">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-bold text-base">Alertes récentes</h2>
      <button 
        v-if="allAlerts.some(a => !a.read)"
        @click="handleMarkAllAsRead"
        class="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        Tout marquer comme lu
      </button>
    </div>
    
    <div v-if="isLoading" class="p-4 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-2 text-sm text-gray-600">Chargement des alertes...</p>
    </div>
    
    <div v-else-if="error" class="p-4 text-center text-red-600">
      <p>{{ error }}</p>
      <button 
        @click="fetchRecentAlerts" 
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
      >
        Réessayer
      </button>
    </div>
    
    <div v-else-if="alerts.length === 0" class="p-4 text-center text-gray-500">
      <p>Aucune alerte récente</p>
    </div>
    
    <div v-else class="space-y-3">
      <div 
        v-for="alert in allAlerts" 
        :key="alert.id" 
        class="flex items-start gap-3 p-3 rounded-lg transition-colors"
        :class="{
          'bg-blue-50': !alert.read && !('severity' in alert),
          'bg-white hover:bg-gray-50': alert.read,
          'border-l-4': 'severity' in alert,
          'border-l-red-500': 'severity' in alert && alert.severity === 'high',
          'border-l-yellow-500': 'severity' in alert && alert.severity === 'medium',
          'border-l-blue-500': 'severity' in alert && alert.severity === 'low',
        }"
      >
        <div class="flex-shrink-0 mt-0.5">
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center"
            :class="getAlertTypeClass(alert.type).bg"
          >
            <i :class="getAlertTypeClass(alert.type).icon"></i>
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <h3 class="font-semibold text-gray-900 text-sm">
              {{ getAlertTitle(alert) }}
              <span 
                v-if="'severity' in alert" 
                class="ml-2 px-2 py-0.5 text-xs rounded-full"
                :class="{
                  'bg-red-100 text-red-800': alert.severity === 'high',
                  'bg-yellow-100 text-yellow-800': alert.severity === 'medium',
                  'bg-blue-100 text-blue-800': alert.severity === 'low'
                }"
              >
                {{ alert.severity === 'high' ? 'Important' : alert.severity === 'medium' ? 'Moyen' : 'Faible' }}
              </span>
            </h3>
            <div class="alert-date">
              {{ formatDate(alert.createdAt) }}
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-1">
            {{ alert.message }}
          </p>
          
          <div v-if="alert.propertyId" class="mt-2 flex items-center text-xs text-gray-500">
            <i class="fas fa-home mr-1"></i>
            <span>Bien #{{ alert.propertyId }}</span>
            
            <template v-if="'contractId' in alert">
              <span class="mx-2">•</span>
              <i class="fas fa-file-contract mr-1"></i>
              <span>Contrat #{{ alert.contractId }}</span>
            </template>
          </div>
          
          <!-- Badge de statut de paiement -->
          <div v-if="'paymentStatus' in alert" class="mt-2">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="{
                'bg-green-100 text-green-800': alert.paymentStatus.status === 'on_time',
                'bg-yellow-100 text-yellow-800': alert.paymentStatus.status === 'upcoming',
                'bg-red-100 text-red-800': alert.paymentStatus.status === 'overdue'
              }"
            >
              <i 
                class="mr-1"
                :class="{
                  'fas fa-check-circle': alert.paymentStatus.status === 'on_time',
                  'fas fa-exclamation-circle': alert.paymentStatus.status === 'upcoming',
                  'fas fa-times-circle': alert.paymentStatus.status === 'overdue'
                }"
              ></i>
              {{ 
                alert.paymentStatus.status === 'on_time' ? 'À jour' :
                alert.paymentStatus.status === 'upcoming' ? 'À venir' : 'En retard'
              }}
            </span>
          </div>
        </div>
        
        <button 
          v-if="!alert.read && !('severity' in alert)"
          @click="handleMarkAsRead(alert.id)"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          title="Marquer comme lu"
        >
          <i class="far fa-check-circle"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useContractStore } from '@/stores/contractStore';
import DashboardService, { type Alert } from '@/services/dashboard.service';

// Extension de l'interface Alert pour les alertes de paiement
interface PaymentAlert extends Omit<Alert, 'type' | 'property' | 'contract' | 'date' | 'status'> {
  type: 'PAYMENT';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  propertyId: string;
  contractId: string;
  severity: 'low' | 'medium' | 'high';
  paymentStatus: {
    status: 'on_time' | 'upcoming' | 'overdue';
    days: number;
  };
  actionRequired: boolean;
}

// Type pour les alertes régulières (basé sur l'interface Alert existante)
type RegularAlert = Omit<Alert, 'type'> & {
  type: Exclude<Alert['type'], 'PAYMENT'>;
  read: boolean;
  propertyId?: string; // Ajout de la propriété propertyId optionnelle
  actionRequired?: boolean; // Ajout de la propriété optionnelle
}

// Type union pour les deux types d'alertes
type CombinedAlert = RegularAlert | PaymentAlert;

const contractStore = useContractStore();
const { contracts } = storeToRefs(contractStore);

// Utilisation de type Assertion pour le ref initial
const alerts = ref<(RegularAlert | PaymentAlert)[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const generatePaymentAlerts = (): PaymentAlert[] => {
  if (!contracts.value) return [];
  
  return contracts.value
    .filter((contract: any) => contract.paymentStatus?.alert)
    .map((contract: any) => {
      const now = new Date().toISOString();
      const severity = contract.paymentStatus.alert.severity as 'low' | 'medium' | 'high';
      
      // Convertir la sévérité en priorité
      const priorityMap = {
        'low': 'LOW' as const,
        'medium': 'MEDIUM' as const,
        'high': 'HIGH' as const
      };
      
      const paymentAlert: PaymentAlert = {
        id: `payment-${contract.id}-${now}`,
        type: 'PAYMENT',
        title: 'Paiement de loyer',
        message: contract.paymentStatus.alert.message,
        priority: priorityMap[severity] || 'MEDIUM',
        status: 'NEW',
        propertyId: contract.property?.id ? String(contract.property.id) : '',
        contractId: String(contract.id),
        severity: severity,
        paymentStatus: {
          status: contract.paymentStatus.status,
          days: contract.paymentStatus.days
        },
        actionRequired: true,
        metadata: {},
        createdAt: now,
        updatedAt: now,
        read: false
      };
      return paymentAlert;
    });
};

const allAlerts = computed<CombinedAlert[]>(() => {
  const paymentAlerts = generatePaymentAlerts();
  const combined = [...alerts.value, ...paymentAlerts];
  
  return combined.sort((a, b) => {
    // Trier par priorité (CRITICAL > HIGH > MEDIUM > LOW) puis par date
    const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
    
    const aPriority = priorityOrder[a.priority] || 0;
    const bPriority = priorityOrder[b.priority] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // Si même priorité, trier par date (plus récent d'abord)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

const fetchRecentAlerts = async () => {
  try {
    isLoading.value = true;
    const response = await DashboardService.getRecentAlerts();
    // Filtrer les alertes de paiement qui sont déjà gérées séparément
    const regularAlerts = (Array.isArray(response) ? response : [])
      .filter((alert: any) => alert.type !== 'PAYMENT')
      .map((alert: any) => {
        const regularAlert: RegularAlert = {
          ...alert,
          type: alert.type as Exclude<Alert['type'], 'PAYMENT'>,
          read: alert.status === 'READ' || alert.status === 'RESOLVED',
          propertyId: alert.property?.id || '',
          status: alert.status || 'NEW',
          actionRequired: alert.actionRequired || false
        };
        return regularAlert;
      });
    alerts.value = regularAlerts;
  } catch (err) {
    console.error('Erreur lors de la récupération des alertes:', err);
    error.value = 'Impossible de charger les alertes';
  } finally {
    isLoading.value = false;
  }
};

const handleMarkAsRead = async (alertId: string) => {
  try {
    // Mise à jour locale immédiate pour un meilleur ressenti utilisateur
    alerts.value = alerts.value.map(alert => {
      if (alert.id === alertId) {
        // Créer un nouvel objet avec les propriétés mises à jour
        const updatedAlert = {
          ...alert,
          read: true,
          status: 'RESOLVED' as const
        };
        
        // Pour les alertes de paiement, s'assurer que le type est correct
        if ('paymentStatus' in alert) {
          return {
            ...updatedAlert,
            type: 'PAYMENT' as const,
            status: 'RESOLVED' as const
          } as PaymentAlert;
        }
        
        return updatedAlert as RegularAlert;
      }
      return alert;
    });
    
    // Appel API en arrière-plan (si l'API est disponible)
    try {
      if (DashboardService && typeof (DashboardService as any).updateAlert === 'function') {
        await (DashboardService as any).updateAlert(alertId, { status: 'RESOLVED' });
      }
    } catch (apiError) {
      console.error('Échec de la mise à jour du statut de l\'alerte sur le serveur:', apiError);
      // On ne fait rien de spécial en cas d'échec, l'alerte reste marquée comme lue localement
    }
  } catch (err) {
    console.error('Erreur lors du marquage de l\'alerte comme lue:', err);
  }
};

const handleMarkAllAsRead = async () => {
  try {
    // Mise à jour locale immédiate pour un meilleur ressenti utilisateur
    alerts.value = alerts.value.map(alert => ({
      ...alert,
      read: true,
      status: 'RESOLVED' as const
    }));
    
    // Appel API en arrière-plan (si l'API est disponible)
    try {
      if (DashboardService) {
        // Essayer d'abord avec markAllAsRead
        if (typeof (DashboardService as any).markAllAsRead === 'function') {
          await (DashboardService as any).markAllAsRead();
        } 
        // Sinon, essayer avec updateAllAlerts
        else if (typeof (DashboardService as any).updateAllAlerts === 'function') {
          await (DashboardService as any).updateAllAlerts({ status: 'RESOLVED' });
        }
      }
    } catch (apiError) {
      console.error('Échec de la mise à jour des alertes sur le serveur:', apiError);
      // On ne fait rien de spécial en cas d'échec, les alertes restent marquées comme lues localement
    }
  } catch (err) {
    console.error('Erreur lors du marquage des alertes comme lues:', err);
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Aujourd\'hui';
  } else if (diffInDays === 1) {
    return 'Hier';
  } else if (diffInDays < 7) {
    return `Il y a ${diffInDays} jours`;
  }

  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fonction utilitaire pour vérifier si une alerte est une alerte de paiement
const isPaymentAlert = (alert: CombinedAlert): alert is PaymentAlert => {
  return 'paymentStatus' in alert;
};

// Fonction pour obtenir le titre de l'alerte
const getAlertTitle = (alert: CombinedAlert): string => {
  if (isPaymentAlert(alert)) {
    return alert.title;
  }
  
  // Logique existante pour les autres types d'alertes
  const typeTitles: Record<RegularAlert['type'], string> = {
    MAINTENANCE: 'Maintenance requise',
    DOCUMENT: 'Document disponible',
    INSPECTION: 'Inspection prévue',
    CONTRACT: 'Mise à jour du contrat',
    TENANT: 'Nouveau message du locataire',
    OTHER: 'Notification'
  };
  
  return alert.title || typeTitles[alert.type] || 'Notification';
};

const getAlertTypeClass = (type: 'PAYMENT' | 'MAINTENANCE' | 'DOCUMENT' | 'INSPECTION' | 'CONTRACT' | 'TENANT' | 'OTHER') => {
  const types = {
    PAYMENT: {
      bg: 'bg-blue-100',
      icon: 'fas fa-money-bill-wave text-blue-600'
    },
    MAINTENANCE: {
      bg: 'bg-yellow-100',
      icon: 'fas fa-tools text-yellow-600'
    },
    DOCUMENT: {
      bg: 'bg-purple-100',
      icon: 'fas fa-file-alt text-purple-600'
    },
    INSPECTION: {
      bg: 'bg-green-100',
      icon: 'fas fa-search text-green-600'
    },
    CONTRACT: {
      bg: 'bg-indigo-100',
      icon: 'fas fa-file-contract text-indigo-600'
    },
    TENANT: {
      bg: 'bg-pink-100',
      icon: 'fas fa-users text-pink-600'
    },
    OTHER: {
      bg: 'bg-gray-100',
      icon: 'fas fa-bell text-gray-600'
    }
  } as const;
  
  return types[type] || types.OTHER;
};

// Charger les données au montage du composant
onMounted(() => {
  fetchRecentAlerts();
});

// Méthodes exposées au template
const markAsRead = handleMarkAsRead;
const markAllAsRead = handleMarkAllAsRead;
</script>

<style scoped>
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}
.alert-enter-from,
.alert-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
