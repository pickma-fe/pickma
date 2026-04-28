export interface ConsumerProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  profileImageUrl?: string;
}

export const mockConsumerProfile: ConsumerProfile = {
  id: 'user-1',
  email: 'customer@example.com',
  name: '김절약',
  phone: '010-1234-5678',
};
