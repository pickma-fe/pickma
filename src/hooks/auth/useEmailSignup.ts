'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AuthResult } from '@/types/auth';
import type { SignUpWithEmailRequest } from '@/contracts/auth';
import { authApi } from '@/api/auth/authApi';

export function useEmailSignup() {
  const queryClient = useQueryClient();

  return useMutation<AuthResult, Error, SignUpWithEmailRequest>({
    mutationFn: (data) => authApi.signUpWithEmail(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
}
