export interface IAddress {
  street: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  countryCode?: string;
  formattedAddress?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isPrimary?: boolean;
  type?: 'home' | 'work' | 'billing' | 'shipping' | 'other';
  notes?: string;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateAddressDto extends Omit<IAddress, 'isVerified' | 'createdAt' | 'updatedAt'> {}

export interface IUpdateAddressDto extends Partial<Omit<IAddress, 'createdAt' | 'updatedAt'>> {}
