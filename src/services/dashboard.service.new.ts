import api from './api';
import type { Property } from '@/types/property';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'VISIT' | 'MAINTENANCE' | 'PAYMENT_DUE' | 'CONTRACT_END' | 'OTHER';
  propertyId?: string;
  contractId?: string;
  allDay?: boolean;
}

export interface Payment {
  id: string;
  property: {
    id: string;
    title: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
  amount: number;
  currency: string;
  paymentMethod: string;
  reference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  receiptUrl?: string;
  relatedContract?: {
    id: string;
    reference: string;
    startDate: string;
    endDate: string;
  };
  usedGuarantee: boolean;
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  type: 'PAYMENT' | 'MAINTENANCE' | 'DOCUMENT' | 'INSPECTION' | 'CONTRACT' | 'TENANT' | 'OTHER';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;
  read: boolean;
  readAt?: string;
  property?: {
    id: string;
    title: string;
    reference: string;
  };
  contract?: {
    id: string;
    reference: string;
    tenantName: string;
  };
  actionRequired: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  totalProperties: number;
  occupiedProperties: number;
  availableProperties: number;
  totalTenants: number;
  activeContracts: number;
  expiringContracts: number;
  totalIncome: number;
  pendingPayments: number;
  overduePayments: number;
  maintenanceRequests: number;
  openTickets: number;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    date: string;
    propertyId?: string;
    contractId?: string;
  }>;
}

class DashboardService {
  // Récupérer les statistiques du tableau de bord
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data?.data || {
        totalProperties: 0,
        occupiedProperties: 0,
        availableProperties: 0,
        totalTenants: 0,
        activeContracts: 0,
        expiringContracts: 0,
        totalIncome: 0,
        pendingPayments: 0,
        overduePayments: 0,
        maintenanceRequests: 0,
        openTickets: 0,
        recentActivity: []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Récupérer les propriétés de l'utilisateur avec les détails complets
  static async getUserProperties(options: {
    includeStats?: boolean;
    includeUpcomingPayments?: boolean;
    includeActiveContracts?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Property[]> {
    try {
      const params = new URLSearchParams();
      
      if (options.includeStats) params.append('includeStats', 'true');
      if (options.includeUpcomingPayments) params.append('includeUpcomingPayments', 'true');
      if (options.includeActiveContracts) params.append('includeActiveContracts', 'true');
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      
      const queryString = params.toString();
      const url = `/properties/my-properties${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data?.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétés:', error);
      return [];
    }
  }

  // Récupérer les paiements récents avec les détails complets
  static async getRecentPayments(options: {
    limit?: number;
    status?: string[];
    propertyId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'date' | 'amount' | 'dueDate';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<Payment[]> {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status?.length) params.append('status', options.status.join(','));
      if (options.propertyId) params.append('propertyId', options.propertyId);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      
      const queryString = params.toString();
      const url = `/payments${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data?.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements récents:', error);
      return [];
    }
  }

  // Récupérer les alertes récentes avec filtrage avancé
  static async getRecentAlerts(options: {
    limit?: number;
    offset?: number;
    types?: string[];
    priorities?: string[];
    statuses?: string[];
    propertyId?: string;
    contractId?: string;
    actionRequired?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: 'createdAt' | 'priority' | 'status' | 'type';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<Alert[]> {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.types?.length) params.append('types', options.types.join(','));
      if (options.priorities?.length) params.append('priorities', options.priorities.join(','));
      if (options.statuses?.length) params.append('statuses', options.statuses.join(','));
      if (options.propertyId) params.append('propertyId', options.propertyId);
      if (options.contractId) params.append('contractId', options.contractId);
      if (options.actionRequired !== undefined) params.append('actionRequired', options.actionRequired.toString());
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      
      const queryString = params.toString();
      const url = `/alerts${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data?.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes récentes:', error);
      return [];
    }
  }

  // Récupérer les événements à venir avec filtrage avancé
  static async getUpcomingEvents(options: number | {
    limit?: number;
    offset?: number;
    types?: string[];
    propertyId?: string;
    contractId?: string;
    startDate?: string;
    endDate?: string;
    includePast?: boolean;
    sortBy?: 'startDate' | 'endDate' | 'type' | 'title';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<CalendarEvent[]> {
    try {
      // Gérer le cas où un nombre est passé directement comme limite
      if (typeof options === 'number') {
        options = { limit: options };
      }

      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset?.toString() || '0');
      if (options.types?.length) params.append('types', options.types.join(','));
      if (options.propertyId) params.append('propertyId', options.propertyId);
      if (options.contractId) params.append('contractId', options.contractId);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.includePast !== undefined) params.append('includePast', options.includePast.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      
      const queryString = params.toString();
      const url = `/calendar/upcoming${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data?.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des événements à venir:', error);
      return [];
    }
  }
}

export default DashboardService;
