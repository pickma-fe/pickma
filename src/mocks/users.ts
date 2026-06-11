import type { UserResponse } from '@/contracts/user';

const MOCK_DATES = {
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-20T00:00:00.000Z',
} as const;

export const mockUser: UserResponse = {
  id: 'user_1',
  email: 'customer@example.com',
  name: '픽마 고객',
  phone: '010-1234-5678',
  authProvider: 'kakao',
  profileImage: '/images/mock/profile.jpg',
  role: 'customer',
  status: 'active',
  ...MOCK_DATES,
};

export const mockSellerUser: UserResponse = {
  id: 'user_seller_1',
  email: 'seller@example.com',
  name: '픽마 판매자',
  phone: '010-9876-5432',
  authProvider: 'kakao',
  profileImage: '/images/mock/profile.jpg',
  role: 'seller',
  status: 'active',
  ...MOCK_DATES,
};

export const mockAdminUser: UserResponse = {
  id: 'user_admin_1',
  email: 'admin@pickma.example.com',
  name: '픽마 관리자',
  phone: '010-0000-0000',
  authProvider: 'email',
  profileImage: '/images/mock/profile.jpg',
  role: 'admin',
  status: 'active',
  ...MOCK_DATES,
};
