export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertAction {
  label: string;
  handler: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
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
  action?: {
    label: string;
    handler: () => void;
  };
  createdAt?: string;
  autoClose?: boolean;
}

export interface AlertState {
  alerts: Alert[];
  unreadCount: number;
}

export interface AlertOptions {
  title?: string;
  timeout?: number;
  autoClose?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  userId?: string;
  propertyId?: string;
  data?: any;
}

export interface AlertInput {
  type: AlertType;
  title: string;
  message: string;
  autoClose?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface AlertStore {
  alerts: Alert[];
  unreadCount: number;
  success: (message: string, options?: AlertOptions) => void;
  error: (message: string, options?: AlertOptions) => void;
  warning: (message: string, options?: AlertOptions) => void;
  info: (message: string, options?: AlertOptions) => void;
  remove: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clear: () => void;
}
