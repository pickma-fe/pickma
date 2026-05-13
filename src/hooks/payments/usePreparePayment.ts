'use client';

import { useMutation } from '@tanstack/react-query';

import type {
  PreparePaymentRequest,
  PreparePaymentResponse,
} from '@/contracts/payment';
import { paymentApi } from '@/api/payments/paymentApi';

export function usePreparePayment() {
  return useMutation<PreparePaymentResponse, Error, PreparePaymentRequest>({
    mutationFn: (body) => paymentApi.preparePayment(body),
  });
}
