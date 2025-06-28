export interface Address {
  street: string;
  quartier?: string;
  commune?: string;
  city: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
}

export interface AddressInput extends Omit<Address, 'additionalInfo'> {
  additionalInfo?: string;
}
