'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/api/auth/authApi';

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['users', 'me'] });
    },
  });
}
