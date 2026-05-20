'use client';

import { useQuery } from '@tanstack/react-query';

import type { AuthSession } from '@/types/auth';
import { authApi } from '@/api/auth/authApi';

export function useAuthSession() {
  return useQuery<AuthSession | undefined>({
    queryKey: ['auth', 'session'],
    queryFn: () => authApi.getSession(),
    staleTime: Infinity,
    retry: false,
  });
}
