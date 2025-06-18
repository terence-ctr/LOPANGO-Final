export interface IIdentity {
  documentType: 'id_card' | 'passport' | 'residence_permit' | 'driver_license' | 'other';
  documentNumber: string;
  issueDate: Date;
  expiryDate?: Date;
  issuingAuthority: string;
  issuingCountry: string;
  frontDocumentUrl: string;
  backDocumentUrl?: string;
  selfieWithDocumentUrl?: string;
  isVerified: boolean;
  verificationNotes?: string;
  verifiedAt?: Date;
  verifiedBy?: string; // Admin ID who verified the identity
  rejectionReason?: string;
  rejectionNotes?: string;
  rejectedAt?: Date;
  rejectedBy?: string; // Admin ID who rejected the identity
  submittedAt: Date;
  updatedAt: Date;
}

export interface ICreateIdentityDto extends Omit<IIdentity, 
  'isVerified' | 'verificationNotes' | 'verifiedAt' | 'verifiedBy' | 
  'rejectionReason' | 'rejectionNotes' | 'rejectedAt' | 'rejectedBy' | 
  'submittedAt' | 'updatedAt'
> {}

export interface IUpdateIdentityDto extends Partial<Omit<IIdentity, 
  'documentType' | 'documentNumber' | 'issueDate' | 'issuingAuthority' | 'issuingCountry' |
  'frontDocumentUrl' | 'submittedAt' | 'createdAt'
>> {
  // Champs spécifiques pouvant être mis à jour
  isVerified?: boolean;
  verificationNotes?: string;
  rejectionReason?: string;
  rejectionNotes?: string;
}
