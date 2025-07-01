export interface DashboardAlert {
  id: string | number;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  date: string;
  read: boolean;
  tenant: string;
  property: string;
  propertyId?: string;
  contractId?: string;
}
