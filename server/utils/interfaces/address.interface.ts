export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
}

export interface AddressInput extends Omit<Address, 'additionalInfo'> {
  // Pour la création/mise à jour, additionalInfo est optionnel
  additionalInfo?: string;
}
