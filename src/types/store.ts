export type StoreStatus = 'active' | 'inactive';
export type OperationStatus = 'open' | 'closed';

export interface UpdateStoreInput {
  name?: string;
  description?: string;
  phone?: string;
  address?: string;
  addressDetail?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  openTime?: string;
  closeTime?: string;
  operationStatus?: OperationStatus;
}

export interface CreateStoreInput {
  name: string;
  description?: string;
  businessNumber: string;
  phone: string;
  address: string;
  addressDetail?: string;
  region: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  openTime?: string;
  closeTime?: string;
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  description?: string;
  businessNumber: string;
  phone: string;
  address: string;
  addressDetail?: string;
  region: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  openTime?: string;
  closeTime?: string;
  status: StoreStatus;
  operationStatus: OperationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MyStore extends Store {
  canSell: boolean;
}

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

export type StoreRegisterReviewStatus = 'pending' | 'reviewing' | 'completed';
export type StoreRegisterApprovalStatus = 'waiting' | 'approved' | 'rejected';

export interface StoreStepState {
  storeInfoSubmitted: boolean;
  reviewStatus: StoreRegisterReviewStatus;
  storeStatus: StoreRegisterApprovalStatus;
}

export interface BusinessInfoData {
  businessNumber: string;
  companyName: string;
  representativeName: string;
  businessAddress: string;
  businessType: string;
  businessCategory: string;
}

export interface StoreInfoData {
  storeName: string;
  category: string;
  phone: string;
  address: string;
  description: string;
}
