export interface Identity {
  nationalId: string;
  documentFront?: string;  // Chemin ou URL du fichier
  documentBack?: string;   // Chemin ou URL du fichier
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;     // ID de l'admin qui a vérifié
}

export interface IdentityInput {
  nationalId: string;
  documentFront?: File;  // Fichier uploadé
  documentBack?: File;   // Fichier uploadé
}

export interface IdentityVerificationInput {
  verified: boolean;
  verifiedBy: string;  // ID de l'admin qui vérifie
  notes?: string;      // Notes optionnelles sur la vérification
}
