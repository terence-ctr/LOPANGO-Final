import type { ContractFormData } from '@/types/contract';

export interface ApiContractData {
  landlordId: string | number;
  tenantId: string | number;
  propertyId: string | number;
  rent: number;
  deposit: number;
  currency: string;
  startDate: string;
  endDate: string | null;
  duration: string;
  status: 'draft' | 'active' | 'pending' | 'ended' | 'cancelled';
  specialConditions?: string;
  usage?: string;
}

/**
 * Convertit les données du formulaire en format attendu par l'API
 */
export const mapContractToApiFormat = (formData: ContractFormData): ApiContractData => {
  return {
    // Champs principaux
    landlordId: formData.landlordId,
    tenantId: formData.tenantId,
    propertyId: formData.propertyId,
    
    // Informations financières
    rent: typeof formData.rent === 'string' ? parseFloat(formData.rent) || 0 : formData.rent,
    deposit: typeof formData.deposit === 'string' ? parseFloat(formData.deposit) || 0 : formData.deposit,
    currency: formData.currency || 'USD',
    
    // Dates et durée
    startDate: formData.startDate,
    endDate: formData.endDate || null,
    duration: formData.duration || '1 an',
    
    // Autres champs
    status: formData.status || 'draft',
    specialConditions: formData.specialConditions || '',
    usage: formData.usage || 'residentiel'
  };
};
