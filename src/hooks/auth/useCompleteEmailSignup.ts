'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AuthResult } from '@/types/auth';
import { authApi } from '@/api/auth/authApi';
import type { CompleteEmailSignupRequest } from '@/contracts';

export function useCompleteEmailSignup() {
  const queryClient = useQueryClient();

  return useMutation<AuthResult, Error, CompleteEmailSignupRequest>({
    mutationFn: (req) => authApi.completeEmailSignup(req),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
}
