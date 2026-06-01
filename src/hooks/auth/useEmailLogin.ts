'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AuthResult } from '@/types/auth';
import type { SignInWithEmailRequest } from '@/contracts/auth';
import { queryKeys } from '@/lib/queryKeys';
import { authApi } from '@/api/auth/authApi';

export function useEmailLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthResult, Error, SignInWithEmailRequest>({
    mutationFn: (data) => authApi.signInWithEmail(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}
