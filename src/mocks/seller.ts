import type {
  OrderDetailResponse,
  OrderListItemResponse,
} from '@/contracts/order';
import type { ProductListItemResponse } from '@/contracts/product';

import { mockOrderDetail, mockOrders } from './orders';
import { mockProducts } from './products';

export const mockSellerProducts: ProductListItemResponse[] = mockProducts;

export const mockSellerCreatedProduct: ProductListItemResponse = {
  ...mockProducts[0],
  id: 'product_new_1',
  name: '새 마감 할인 상품',
};

export const mockSellerOrders: OrderListItemResponse[] = mockOrders;

export const mockSellerOrderDetail: OrderDetailResponse = mockOrderDetail;

type ReviewStatus = 'pending' | 'reviewing' | 'completed';
type CertificationStatus = 'waiting' | 'approved' | 'rejected';
type StoreReviewStatus = 'pending' | 'reviewing' | 'completed';
type StoreStatus = 'waiting' | 'approved' | 'rejected';

export interface MockAuthStepState {
  termsAgreed: boolean;
  businessInfoSubmitted: boolean;
  documentsSubmitted: boolean;
  reviewStatus: ReviewStatus;
  certificationStatus: CertificationStatus;
  rejectionReason?: string;
}

export interface MockStoreStepState {
  storeInfoSubmitted: boolean;
  reviewStatus: StoreReviewStatus;
  storeStatus: StoreStatus;
}

// 판매자 인증 초기 상태
export const mockSellerAuthState: MockAuthStepState = {
  termsAgreed: false,
  businessInfoSubmitted: false,
  documentsSubmitted: false,
  reviewStatus: 'pending',
  certificationStatus: 'waiting',
  rejectionReason: undefined,
};

// 가게 등록 초기 상태
export const mockStoreRegisterState: MockStoreStepState = {
  storeInfoSubmitted: false,
  reviewStatus: 'pending',
  storeStatus: 'waiting',
};

// 테스트용 - 인증 완료 상태
export const mockSellerAuthCompleted: MockAuthStepState = {
  termsAgreed: true,
  businessInfoSubmitted: true,
  documentsSubmitted: true,
  reviewStatus: 'completed',
  certificationStatus: 'approved',
  rejectionReason: undefined,
};

// 테스트용 - 반려 상태
export const mockSellerAuthRejected: MockAuthStepState = {
  termsAgreed: true,
  businessInfoSubmitted: true,
  documentsSubmitted: true,
  reviewStatus: 'completed',
  certificationStatus: 'rejected',
  rejectionReason: '서류가 불명확합니다. 다시 제출해주세요.',
};

// 테스트용 - 심사 중 상태
export const mockSellerAuthReviewing: MockAuthStepState = {
  termsAgreed: true,
  businessInfoSubmitted: true,
  documentsSubmitted: true,
  reviewStatus: 'reviewing',
  certificationStatus: 'waiting',
  rejectionReason: undefined,
};

// 테스트용 - 가게 등록 완료 상태
export const mockStoreRegisterCompleted: MockStoreStepState = {
  storeInfoSubmitted: true,
  reviewStatus: 'completed',
  storeStatus: 'approved',
};
