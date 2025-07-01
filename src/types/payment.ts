export interface Payment {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'failed';
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFormData {
  amount: number;
  currency: string;
  dueDate: string;
  propertyId: string;
  tenantId: string;
  notes?: string;
}

export interface PaymentFilter {
  status?: string;
  propertyId?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentStats {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}
