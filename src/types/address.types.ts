export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
}

export interface AddressInput extends Omit<Address, 'additionalInfo'> {
  additionalInfo?: string;
}
