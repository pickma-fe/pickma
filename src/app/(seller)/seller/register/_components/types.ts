export type ModalType = 'terms' | 'business' | 'document' | 'storeInfo' | null;

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

export interface StoreStep {
  id: number;
  title: string;
  description: string;
  status: 'done' | 'active' | 'pending';
  action: string;
  modal: ModalType;
}
