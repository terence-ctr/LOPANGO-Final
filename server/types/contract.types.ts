import { Request } from 'express';

// Définition des types pour les requêtes de contrat
export interface ContractRequest extends Request {
  user?: {
    id: number;
    email: string;
    userType: string;
    firstName: string;
    lastName: string;
    email_verified: boolean;
  };
}

export interface ContractQueryResult {
  id: number;
  name: string;
  tenant_id: number;
  landlord_id: number;
  property_id: number;
  start_date: string;
  end_date: string | null;
  status: string;
  rent_amount: number;
  deposit_amount: number;
  deposit_status: string;
  payment_day: number;
  created_at: string;
  updated_at: string;
  property_title: string;
  property_address_street: string;
  property_address_city: string;
  property_address_postal_code: string;
  property_address_country: string;
  landlord_first_name: string;
  landlord_last_name: string;
  landlord_email: string;
  tenant_first_name?: string;
  tenant_last_name?: string;
  tenant_email?: string;
  title?: string; // Pour la propriété
}

export interface FormattedContract {
  id: number;
  name: string;
  property: {
    id: number;
    name: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    landlord: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  tenant: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  startDate: string;
  endDate: string | null;
  status: string;
  paymentStatus: string;
  paymentDays: number;
  paymentAlert: {
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    severity: 'low' | 'medium' | 'high';
  };
  rentAmount: number;
  depositAmount: number;
  depositStatus: string;
  paymentDay: number;
  createdAt: string;
  updatedAt: string;
}

// Interface pour le statut de paiement
export interface PaymentStatus {
  status: 'on_time' | 'late' | 'pending' | 'unknown' | 'overdue' | 'upcoming';
  days: number;
  alert: {
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    severity: 'low' | 'medium' | 'high';
  };
}
