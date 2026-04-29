import type {
  AdminStoreListResponse,
  AdminStoreResponse,
} from '@/contracts/admin';

export const mockAdminStores: AdminStoreResponse[] = [
  {
    id: 'store_1',
    userId: 'user_seller_1',
    name: '픽마 베이커리',
    description: '매일 아침 굽는 동네 베이커리입니다.',
    businessNumber: '123-45-67890',
    phone: '02-1234-5678',
    address: '서울시 마포구 월드컵북로 12',
    addressDetail: '1층',
    region: '서울 마포구',
    image: '/images/mock/store-bakery.jpg',
    status: 'approved',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-20T00:00:00.000Z',
  },
  {
    id: 'store_pending_1',
    userId: 'user_seller_2',
    name: '픽마 델리',
    businessNumber: '987-65-43210',
    phone: '02-9876-5432',
    address: '서울시 성동구 왕십리로 20',
    region: '서울 성동구',
    status: 'pending',
    createdAt: '2026-04-25T00:00:00.000Z',
    updatedAt: '2026-04-25T00:00:00.000Z',
  },
];

export const mockAdminStoreList: AdminStoreListResponse = {
  items: mockAdminStores,
  page: 1,
  pageSize: 20,
  totalCount: mockAdminStores.length,
  totalPages: 1,
};

const pendingStores = mockAdminStores.filter(
  (store) => store.status === 'pending'
);

export const mockPendingAdminStoreList: AdminStoreListResponse = {
  items: pendingStores,
  page: 1,
  pageSize: 20,
  totalCount: pendingStores.length,
  totalPages: Math.ceil(pendingStores.length / 20),
};
