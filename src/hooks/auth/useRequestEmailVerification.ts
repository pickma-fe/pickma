'use client';

import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/api/auth/authApi';
import type {
  RequestEmailVerificationRequest,
  RequestEmailVerificationResponse,
} from '@/contracts';

export function useRequestEmailVerification() {
  return useMutation<
    RequestEmailVerificationResponse,
    Error,
    RequestEmailVerificationRequest
  >({
    mutationFn: (req) => authApi.requestEmailVerification(req),
  });
}
