import type { UserResponse } from '@/contracts/user';

export const mockUser: UserResponse = {
  id: 'user_1',
  email: 'customer@example.com',
  name: '픽마 고객',
  phone: '010-1234-5678',
  profileImage: '/images/mock/profile.jpg',
  role: 'customer',
  status: 'active',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-20T00:00:00.000Z',
};

export const mockAdminUser: UserResponse = {
  id: 'user_admin_1',
  email: 'admin@pickma.example.com',
  name: '픽마 관리자',
  role: 'admin',
  status: 'active',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-20T00:00:00.000Z',
};
