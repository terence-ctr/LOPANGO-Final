export interface Address {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface Agent {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: Address;
  userType?: 'agent';
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
