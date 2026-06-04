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

export interface AdminPendingSellerApplicationListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  createdDate?: string;
  businessCategory?: string;
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
