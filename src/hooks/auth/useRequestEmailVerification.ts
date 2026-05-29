'use client';

import { useMutation } from '@tanstack/react-query';

import type {
  RequestEmailVerificationRequest,
  RequestEmailVerificationResponse,
} from '@/contracts/auth';
import { authApi } from '@/api/auth/authApi';

export function useRequestEmailVerification() {
  return useMutation<
    RequestEmailVerificationResponse,
    Error,
    RequestEmailVerificationRequest
  >({
    mutationFn: (req) => authApi.requestEmailVerification(req),
  });
}
