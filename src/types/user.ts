export interface Address {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  // Alias pour la rétrocompatibilité
  postal_code?: string;
  address?: string;
}

export interface Identity {
  nationalId: string;
  documentType: string;
}

export interface User {
  id?: string | number; // Pour la compatibilité avec différents formats d'ID
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: Address;
  identity: Identity;
  nationality?: string;
  userType?: string;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  companyName?: string;
  // Champs pour la rétrocompatibilité
  first_name?: string;
  last_name?: string;
  user_type?: string;
}

export interface Landlord extends User {
  properties?: string[];
  contracts?: string[];
}

export interface Tenant extends User {
  contracts?: string[];
  guarantor?: User;
}
