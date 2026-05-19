export type SellerApplicationDocumentType =
  | 'business_license'
  | 'id_card'
  | 'bankbook'
  | 'business_report';

export interface SellerApplicationDocumentResponse {
  id: string;
  applicationId: string;
  type: SellerApplicationDocumentType;
  storagePath: string;
  originalFileName: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export interface CreateSellerApplicationRequest {
  businessNumber: string;
  companyName: string;
  representativeName: string;
  businessAddress: string;
  businessType: string;
  businessCategory: string;
  documents: Array<{
    type: SellerApplicationDocumentType;
    storagePath: string;
    originalFileName: string;
    contentType: string;
    size: number;
  }>;
}

export interface SellerApplicationResponse {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  businessNumber: string;
  companyName: string;
  representativeName: string;
  businessAddress: string;
  businessType: string;
  businessCategory: string;
  rejectReason?: string;
  reviewedAt?: string;
  documents: SellerApplicationDocumentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface SellerOnboardingStatusResponse {
  role: 'customer' | 'seller' | 'admin';
  applicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  hasStore: boolean;
  latestRejectReason?: string;
}

export interface SellerApplicationDocumentReadUrlResponse {
  signedUrl: string;
}
