import type { UserRole } from './user';

export type SellerApplicationStatus = 'pending' | 'approved' | 'rejected';

export type SellerApplicationDocumentType =
  | 'business_license'
  | 'food_service_permit'
  | 'bank_account';

export interface SellerApplicationDocument {
  id: string;
  applicationId: string;
  type: SellerApplicationDocumentType;
  storagePath: string;
  originalFileName: string;
  contentType: string;
  size: number;
  createdAt: Date;
}

export interface SellerApplication {
  id: string;
  userId: string;
  status: SellerApplicationStatus;
  businessNumber: string;
  companyName: string;
  representativeName: string;
  businessAddress: string;
  businessType: string;
  businessCategory: string;
  documentConsentAgreed: boolean;
  documentConsentAgreedAt?: Date;
  rejectReason?: string;
  reviewedAt?: Date;
  documents: SellerApplicationDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export type SellerApplicationDocumentFiles = {
  businessLicense: File;
  foodServicePermit: File;
  bankAccount: File;
};

export interface CreateSellerApplicationInput {
  businessNumber: string;
  companyName: string;
  representativeName: string;
  businessAddress: string;
  businessType: string;
  businessCategory: string;
  documentConsentAgreed: boolean;
  documents: SellerApplicationDocumentFiles;
}

export interface SellerApplicationDocumentUploadInput {
  type: SellerApplicationDocumentType;
  storagePath: string;
  originalFileName: string;
  contentType: string;
  size: number;
}

export interface CreateSellerApplicationPayload extends Omit<
  CreateSellerApplicationInput,
  'documents'
> {
  documents: SellerApplicationDocumentUploadInput[];
}

export interface AdminPendingSellerApplication extends Omit<
  SellerApplication,
  | 'status'
  | 'documentConsentAgreed'
  | 'documentConsentAgreedAt'
  | 'rejectReason'
  | 'reviewedAt'
> {
  applicantEmail: string;
  applicantName: string;
  applicantPhone?: string;
  status: 'pending';
}

export type SellerApplicationStatusForOnboarding =
  | 'none'
  | SellerApplicationStatus;

export interface SellerOnboardingStatus {
  role: UserRole;
  applicationStatus: SellerApplicationStatusForOnboarding;
  hasStore: boolean;
  latestRejectReason?: string;
}
