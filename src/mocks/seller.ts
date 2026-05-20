import type { MenuItemResponse } from '@/contracts/menu-item';
import type {
  OrderDetailResponse,
  OrderListItemResponse,
  OrderListResponse,
} from '@/contracts/order';
import type { ProductListItemResponse } from '@/contracts/product';
import type {
  SellerApplicationResponse,
  SellerOnboardingStatusResponse,
} from '@/contracts/seller-application';

import { mockOrderDetail, mockOrders } from './orders';
import { mockProducts } from './products';

export const mockSellerApplication: SellerApplicationResponse = {
  id: 'application_mock_1',
  userId: 'user_mock_1',
  status: 'pending',
  businessNumber: '000-00-00001',
  companyName: '테스트 회사',
  representativeName: '테스트 대표',
  businessAddress: '서울시 테스트구 테스트로 1',
  businessType: '식품',
  businessCategory: '베이커리',
  documents: [
    {
      id: 'doc_mock_1',
      applicationId: 'application_mock_1',
      type: 'business_license',
      storagePath: '/images/mock/documents/business-license.jpeg',
      originalFileName: 'business-license.jpeg',
      contentType: 'image/jpeg',
      size: 102400,
      createdAt: '2026-05-18T00:00:00.000Z',
    },
    {
      id: 'doc_mock_2',
      applicationId: 'application_mock_1',
      type: 'id_card',
      storagePath: '/images/mock/documents/id-card.jpeg',
      originalFileName: 'id-card.jpeg',
      contentType: 'image/jpeg',
      size: 102400,
      createdAt: '2026-05-18T00:00:00.000Z',
    },
    {
      id: 'doc_mock_3',
      applicationId: 'application_mock_1',
      type: 'bankbook',
      storagePath: '/images/mock/documents/bankbook.jpeg',
      originalFileName: 'bankbook.jpeg',
      contentType: 'image/jpeg',
      size: 102400,
      createdAt: '2026-05-18T00:00:00.000Z',
    },
    {
      id: 'doc_mock_4',
      applicationId: 'application_mock_1',
      type: 'business_report',
      storagePath: '/images/mock/documents/business-report.jpeg',
      originalFileName: 'business-report.jpeg',
      contentType: 'image/jpeg',
      size: 102400,
      createdAt: '2026-05-18T00:00:00.000Z',
    },
  ],
  createdAt: '2026-05-18T00:00:00.000Z',
  updatedAt: '2026-05-18T00:00:00.000Z',
};

export const mockSellerMenuItems: MenuItemResponse[] = [
  {
    id: '00000000-0000-4000-8000-000000000041',
    storeId: '00000000-0000-4000-8000-000000000031',
    categoryId: '00000000-0000-4000-8000-000000000011',
    categoryName: '베이커리',
    name: '마감 할인 크루아상 세트',
    description: '당일 생산 후 남은 크루아상과 페이스트리를 담은 세트입니다.',
    originalPrice: 12000,
    status: 'active',
    createdAt: '2026-05-18T09:00:00.000Z',
    updatedAt: '2026-05-18T09:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000042',
    storeId: '00000000-0000-4000-8000-000000000031',
    categoryId: '00000000-0000-4000-8000-000000000011',
    categoryName: '베이커리',
    name: '페이스트리 박스',
    description: '갓 구운 페이스트리 모음 박스입니다.',
    originalPrice: 9000,
    status: 'active',
    createdAt: '2026-05-18T09:00:00.000Z',
    updatedAt: '2026-05-18T09:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000043',
    storeId: '00000000-0000-4000-8000-000000000031',
    categoryId: '00000000-0000-4000-8000-000000000012',
    categoryName: '카페/음료',
    name: '아메리카노 세트',
    description: '아메리카노 2잔 세트입니다.',
    originalPrice: 8000,
    status: 'inactive',
    createdAt: '2026-05-18T09:00:00.000Z',
    updatedAt: '2026-05-18T09:00:00.000Z',
  },
];

export const mockCreatedSellerMenuItem: MenuItemResponse = {
  id: '00000000-0000-4000-8000-000000000049',
  storeId: '00000000-0000-4000-8000-000000000031',
  categoryId: '00000000-0000-4000-8000-000000000011',
  categoryName: '베이커리',
  name: '새 메뉴',
  originalPrice: 10000,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockSellerProducts: ProductListItemResponse[] = mockProducts;

export const mockSellerCreatedProduct: ProductListItemResponse = {
  ...mockProducts[0],
  id: 'product_new_1',
  name: '새 마감 할인 상품',
};

export const mockSellerOrders: OrderListItemResponse[] = mockOrders;

export const mockSellerOrderList: OrderListResponse = {
  items: mockOrders,
  page: 1,
  pageSize: 20,
  totalCount: mockOrders.length,
  totalPages: 1,
};

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

export const mockSellerOnboardingStatus: SellerOnboardingStatusResponse = {
  role: 'customer',
  applicationStatus: 'pending',
  hasStore: false,
};
