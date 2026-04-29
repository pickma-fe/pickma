'use client';

import { useQuery } from '@tanstack/react-query';

import type { User } from '@/types/user';
import { userApi } from '@/api/users/userApi';

export function useMe() {
  return useQuery<User>({
    queryKey: ['users', 'me'],
    queryFn: () => userApi.getMe(),
  });
}
