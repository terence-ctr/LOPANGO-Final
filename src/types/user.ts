export interface Address {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface Identity {
  nationalId: string;
  documentType: string;
}

export interface User {
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
}

export interface Landlord extends User {
  properties?: string[];
  contracts?: string[];
}

export interface Tenant extends User {
  contracts?: string[];
  guarantor?: User;
}
