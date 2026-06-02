'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { authApi } from '@/api/auth/authApi';

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.users.me() });
    },
  });
}
