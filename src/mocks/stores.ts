import type { StoreResponse } from '@/contracts/store';

export const mockMyStore: StoreResponse = {
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
  openTime: '09:00:00',
  closeTime: '22:00:00',
  status: 'approved',
  canSell: true,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-20T00:00:00.000Z',
};

export const mockPendingStore: StoreResponse = {
  ...mockMyStore,
  id: 'store_pending_1',
  userId: 'user_seller_2',
  name: '픽마 델리',
  status: 'pending',
  canSell: false,
};
