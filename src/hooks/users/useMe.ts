'use client';

import { useQuery } from '@tanstack/react-query';

import type { User } from '@/types/user';
import { queryKeys } from '@/lib/queryKeys';
import { ApiError } from '@/api/apiClient';
import { userApi } from '@/api/users/userApi';

export function useMe() {
  return useQuery<User>({
    queryKey: queryKeys.users.me(),
    queryFn: () => userApi.getMe(),
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.statusCode === 401 || error.code === 'UNAUTHORIZED')
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
