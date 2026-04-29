import type { User } from '@/types/user';
import type { UserResponse } from '@/contracts/user';

import { apiClient } from '../apiClient';
import { mapUser } from './userMapper';

export const userApi = {
  getMe(): Promise<User> {
    return apiClient.get<UserResponse>('/api/users/me').then(mapUser);
  },
};
