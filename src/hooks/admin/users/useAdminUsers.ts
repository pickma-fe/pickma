'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { User } from '@/types/user';
import { queryKeys } from '@/lib/queryKeys';
import { adminUserApi } from '@/api/admin/users/adminUserApi';

export type AdminUsersQuery = NonNullable<
  Parameters<typeof adminUserApi.getUsers>[0]
>;

export function useAdminUsers(
  params: AdminUsersQuery = {}
): UseQueryResult<PaginatedResult<User>> {
  return useQuery<PaginatedResult<User>>({
    queryKey: queryKeys.admin.users.list(params),
    queryFn: () => adminUserApi.getUsers(params),
  });
}
