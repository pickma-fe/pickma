import type { UserRole } from './user';

export type SellerApplicationStatus = 'pending' | 'approved' | 'rejected';

export type SellerApplicationDocumentType =
  | 'business_license'
  | 'id_card'
  | 'bankbook'
  | 'business_report';

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
  rejectReason?: string;
  reviewedAt?: Date;
  documents: SellerApplicationDocument[];
  createdAt: Date;
  updatedAt: Date;
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
