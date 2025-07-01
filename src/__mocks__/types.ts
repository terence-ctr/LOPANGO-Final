// Types pour les données mockées

export interface MockPayment {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  propertyId: string;
  propertyName: string;
}

export interface MockAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  read: boolean;
  propertyId?: string;
  contractId?: string;
  propertyName?: string;
}

export interface MockProperty {
  id: string;
  name: string;
  address: string;
  rent: number;
  status: 'active' | 'inactive' | 'maintenance';
  image?: string;
  description?: string;
}
