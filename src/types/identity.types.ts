export type DocumentType = 'permis de conduire' | 'passeport' | 'carte d\'électeur';

export interface Identity {
  documentType: DocumentType;
  nationalId: string;
  documentFront?: File;  // Fichier image du document recto
  documentBack?: File;  // Fichier image du document verso
  verified: boolean;x
  verifiedAt?: Date;
  verifiedBy?: string;     // ID de l'admin qui a vérifié
}

export interface IdentityInput {
  documentType: DocumentType;
  nationalId: string;
  documentFront?: File;
  documentBack?: File;
}

export interface IdentityVerificationInput {
  verified: boolean;
  verifiedBy: string;  // ID de l'admin
  comment?: string;   // Commentaire optionnel sur la vérification
}
