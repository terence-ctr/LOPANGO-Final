export interface ServerIdentity {
  nationalId: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  verified: boolean;
  verifiedAt?: Date | null;
  verifiedBy?: string | null;
  verificationComment?: string;
}

export interface IdentityVerificationInput {
  verified: boolean;
  verifiedBy: string;
  comment?: string;
}
