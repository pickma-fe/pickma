import type { MenuItemResponse } from '@/contracts/menu-item';
import type {
  OrderDetailResponse,
  OrderListItemResponse,
  OrderListResponse,
} from '@/contracts/order';
import type { ProductListItemResponse } from '@/contracts/product';
import type { SellerDashboardStatsResponse } from '@/contracts/seller';
import type {
  SellerApplicationResponse,
  SellerOnboardingStatusResponse,
} from '@/contracts/seller-application';

import { mockOrderItems } from './orders';
import { mockProducts } from './products';

const MOCK_SELLER_ORDER_ID_1 = '00000000-0000-4000-8000-000000000701';
const MOCK_SELLER_ORDER_ID_2 = '00000000-0000-4000-8000-000000000702';
const MOCK_SELLER_ORDER_ID_3 = '00000000-0000-4000-8000-000000000703';

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
  documentConsentAgreed: true,
  documentConsentAgreedAt: '2026-05-18T00:00:00.000Z',
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
      type: 'food_service_permit',
      storagePath: '/images/mock/documents/food-service-permit.jpeg',
      originalFileName: 'food-service-permit.jpeg',
      contentType: 'image/jpeg',
      size: 102400,
      createdAt: '2026-05-18T00:00:00.000Z',
    },
    {
      id: 'doc_mock_3',
      applicationId: 'application_mock_1',
      type: 'bank_account',
      storagePath: '/images/mock/documents/bank-account.jpeg',
      originalFileName: 'bank-account.jpeg',
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

export const mockSellerOrders: OrderListItemResponse[] = [
  {
    id: MOCK_SELLER_ORDER_ID_1,
    orderNumber: 'PM20260429A1B2C3D4E5',
    storeId: 'store_1',
    storeName: '픽마 베이커리',
    totalAmount: 12000,
    discountAmount: 4800,
    paymentAmount: 7200,
    status: 'reserved',
    pickupAt: '2026-04-29T11:30:00.000Z',
    pickupServiceDate: '2026-04-29',
    storeOrderNumber: '20260429-0000001',
    pickupNumber: 'A-01',
    expiresAt: '2026-04-29T10:10:00.000Z',
    image: '/images/mock/menus/menu-sandwich.jpg',
    createdAt: '2026-04-29T10:00:00.000Z',
    updatedAt: '2026-04-29T10:01:00.000Z',
  },
  {
    id: MOCK_SELLER_ORDER_ID_2,
    orderNumber: 'PM20260429F6A7B8C9D0',
    storeId: 'store_1',
    storeName: '픽마 베이커리',
    totalAmount: 9800,
    discountAmount: 3900,
    paymentAmount: 5900,
    status: 'no_show',
    pickupAt: '2026-04-29T12:00:00.000Z',
    pickupServiceDate: '2026-04-29',
    storeOrderNumber: '20260429-0000002',
    pickupNumber: 'A-02',
    image: '/images/mock/menus/menu-cheesecake.jpg',
    createdAt: '2026-04-29T10:10:00.000Z',
    updatedAt: '2026-04-29T10:10:00.000Z',
  },
  {
    id: MOCK_SELLER_ORDER_ID_3,
    orderNumber: 'PM20260429E1F2A3B4C5',
    storeId: 'store_1',
    storeName: '픽마 베이커리',
    totalAmount: 11000,
    discountAmount: 3300,
    paymentAmount: 7700,
    status: 'completed',
    pickupAt: '2026-04-28T13:00:00.000Z',
    pickupServiceDate: '2026-04-28',
    storeOrderNumber: '20260428-0000003',
    pickupNumber: 'B-03',
    image: '/images/mock/menus/menu-coffee.jpg',
    createdAt: '2026-04-28T10:30:00.000Z',
    updatedAt: '2026-04-28T13:05:00.000Z',
  },
];

export const mockSellerOrderList: OrderListResponse = {
  items: mockSellerOrders,
  page: 1,
  pageSize: 20,
  totalCount: mockSellerOrders.length,
  totalPages: 1,
};

export const mockSellerOrderDetailsMap: Record<string, OrderDetailResponse> =
  Object.fromEntries(
    mockSellerOrders.map((order) => [
      order.id,
      {
        ...order,
        items: mockOrderItems.filter((item) => item.orderId === order.id),
      },
    ])
  );

export const mockSellerOrderDetail: OrderDetailResponse = {
  ...mockSellerOrders[0],
  items: mockOrderItems.filter(
    (item) => item.orderId === mockSellerOrders[0].id
  ),
};

type ReviewStatus = 'pending' | 'reviewing' | 'completed';
type CertificationStatus = 'waiting' | 'approved' | 'rejected';
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
  storeStatus: StoreStatus;
}

export const mockSellerAuthState: MockAuthStepState = {
  termsAgreed: false,
  businessInfoSubmitted: false,
  documentsSubmitted: false,
  reviewStatus: 'pending',
  certificationStatus: 'waiting',
  rejectionReason: undefined,
};

export const mockStoreRegisterState: MockStoreStepState = {
  storeInfoSubmitted: false,
  storeStatus: 'waiting',
};

export const mockSellerAuthCompleted: MockAuthStepState = {
  termsAgreed: true,
  businessInfoSubmitted: true,
  documentsSubmitted: true,
  reviewStatus: 'completed',
  certificationStatus: 'approved',
  rejectionReason: undefined,
};

export const mockSellerAuthRejected: MockAuthStepState = {
  termsAgreed: true,
  businessInfoSubmitted: true,
  documentsSubmitted: true,
  reviewStatus: 'completed',
  certificationStatus: 'rejected',
  rejectionReason: '서류가 불명확합니다. 다시 제출해주세요.',
};

export const mockSellerAuthReviewing: MockAuthStepState = {
  termsAgreed: true,
  businessInfoSubmitted: true,
  documentsSubmitted: true,
  reviewStatus: 'reviewing',
  certificationStatus: 'waiting',
  rejectionReason: undefined,
};

export const mockStoreRegisterCompleted: MockStoreStepState = {
  storeInfoSubmitted: true,
  storeStatus: 'approved',
};

export const mockSellerOnboardingStatus: SellerOnboardingStatusResponse = {
  role: 'customer',
  applicationStatus: 'pending',
  hasStore: false,
};

export const mockSellerDashboardStats: SellerDashboardStatsResponse = {
  totalSalesAmount: 1_480_000,
  totalOrderCount: 124,
  dailyMetrics: [
    { date: '2026-05-30T00:00:00.000Z', orderCount: 8, salesAmount: 96_000 },
    { date: '2026-05-31T00:00:00.000Z', orderCount: 12, salesAmount: 144_000 },
    { date: '2026-06-01T00:00:00.000Z', orderCount: 6, salesAmount: 72_000 },
    { date: '2026-06-02T00:00:00.000Z', orderCount: 15, salesAmount: 180_000 },
    { date: '2026-06-03T00:00:00.000Z', orderCount: 10, salesAmount: 120_000 },
    { date: '2026-06-04T00:00:00.000Z', orderCount: 18, salesAmount: 216_000 },
    { date: '2026-06-05T00:00:00.000Z', orderCount: 14, salesAmount: 168_000 },
  ],
  recentOrders: [
    {
      id: 'order-mock-dash-1',
      orderNumber: 'PM20260605A1B2C3D4E5',
      productName: '딸기 케이크',
      paymentAmount: 18_000,
      status: 'reserved',
      createdAt: '2026-06-05T03:10:00.000Z',
    },
    {
      id: 'order-mock-dash-2',
      orderNumber: 'PM20260605F6A7B8C9D0',
      productName: '마카롱 세트',
      paymentAmount: 24_000,
      status: 'accepted',
      createdAt: '2026-06-05T02:50:00.000Z',
    },
    {
      id: 'order-mock-dash-3',
      orderNumber: 'PM20260605E1F2A3B4C5',
      productName: '소금빵',
      paymentAmount: 9_000,
      status: 'completed',
      createdAt: '2026-06-05T02:00:00.000Z',
    },
  ],
};
