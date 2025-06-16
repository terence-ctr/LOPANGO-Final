// Types partagés entre le frontend et le backend

export interface IdentityBase {
  nationalId: string;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string; // ID de l'admin qui a vérifié
  documentFrontUrl?: string; // URL vers le fichier uploadé
  documentBackUrl?: string;  // URL vers le fichier uploadé
}

export interface Identity extends IdentityBase {
  documentFront?: File;  // Utilisé côté frontend pour l'upload
  documentBack?: File;   // Utilisé côté frontend pour l'upload
}

export interface IdentityInput {
  nationalId: string;
  documentFront?: File;
  documentBack?: File;
}

export interface IdentityVerificationInput {
  verified: boolean;
  verifiedBy: string;  // ID de l'admin
  comment?: string;   // Commentaire optionnel sur la vérification
}
