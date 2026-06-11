import type { UpdateMeInput, User } from '@/types/user';
import type { UpdateMeRequest, UserResponse } from '@/contracts/user';

import { apiClient } from '../apiClient';
import { mapUser } from './userMapper';

function toUpdateMeRequest(input: UpdateMeInput): UpdateMeRequest {
  return { ...input };
}

export const userApi = {
  getMe(): Promise<User> {
    return apiClient.get<UserResponse>('/api/users/me').then(mapUser);
  },

  updateMe(input: UpdateMeInput): Promise<User> {
    return apiClient
      .patch<UserResponse>('/api/users/me', toUpdateMeRequest(input))
      .then(mapUser);
  },

  deleteMe(): Promise<void> {
    return apiClient.delete<void>('/api/users/me').then(() => undefined);
  },
};
