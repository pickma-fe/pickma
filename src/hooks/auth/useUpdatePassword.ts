'use client';

import { useMutation } from '@tanstack/react-query';

import type { AuthResult } from '@/types/auth';
import type { UpdatePasswordRequest } from '@/contracts/auth';
import { authApi } from '@/api/auth/authApi';

export function useUpdatePassword() {
  return useMutation<AuthResult, Error, UpdatePasswordRequest>({
    mutationFn: (data) => authApi.updatePassword(data),
  });
}
