// Wizard UI 상태 타입
export type ReviewStatus = 'pending' | 'reviewing' | 'completed';
export type CertificationStatus = 'waiting' | 'approved' | 'rejected';

export interface AuthStepState {
  termsAgreed: boolean;
  businessInfoSubmitted: boolean;
  documentsSubmitted: boolean;
  reviewStatus: ReviewStatus;
  certificationStatus: CertificationStatus;
  rejectionReason?: string;
}

export type StoreRegisterApprovalStatus = 'waiting' | 'approved' | 'rejected';

export interface StoreStepState {
  storeInfoSubmitted: boolean;
  storeStatus: StoreRegisterApprovalStatus;
}

export type ModalType = 'terms' | 'business' | 'document' | null;
