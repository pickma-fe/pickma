import type { User } from '@/types/auth';

export type ConsumerProfile = Pick<
  User,
  'id' | 'email' | 'name' | 'phone' | 'profileImageUrl'
>;

export const mockConsumerProfile: ConsumerProfile = {
  id: 'user-1',
  email: 'customer@example.com',
  name: '김절약',
  phone: '010-1234-5678',
};
