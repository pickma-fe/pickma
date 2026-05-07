import type { User } from '@/types/user';
import type { UpdateMeRequest, UserResponse } from '@/contracts/user';

import { apiClient } from '../apiClient';
import { mapUser } from './userMapper';

export const userApi = {
  getMe(): Promise<User> {
    return apiClient.get<UserResponse>('/api/users/me').then(mapUser);
  },

  updateMe(data: UpdateMeRequest): Promise<User> {
    return apiClient.patch<UserResponse>('/api/users/me', data).then(mapUser);
  },
};
