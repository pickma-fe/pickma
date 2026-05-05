export type ModalType = 'terms' | 'business' | 'document' | 'storeInfo' | null;

export type {
  AuthStepState,
  ReviewStatus,
  CertificationStatus,
  StoreStepState,
  StoreRegisterReviewStatus,
  StoreRegisterApprovalStatus,
} from '@/types/store';

export interface StoreStep {
  id: number;
  title: string;
  description: string;
  status: 'done' | 'active' | 'pending';
  action: string;
  modal: ModalType;
}
