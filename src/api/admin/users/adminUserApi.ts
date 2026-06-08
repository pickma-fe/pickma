import type { PaginatedResult } from '@/types/common';
import type { User } from '@/types/user';
import type {
  AdminUserListQuery,
  AdminUserListResponse,
} from '@/contracts/admin';
import { apiClient } from '@/api/apiClient';
import { mapUser } from '@/api/users/userMapper';

export const adminUserApi = {
  getUsers(params: AdminUserListQuery = {}): Promise<PaginatedResult<User>> {
    return apiClient
      .get<AdminUserListResponse>('/api/admin/users', params)
      .then((res) => ({ ...res, items: res.items.map(mapUser) }));
  },
};
