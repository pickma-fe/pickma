'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ConfirmPaymentRequest } from '@/contracts/payment';
import { paymentApi } from '@/api/payments/paymentApi';

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ConfirmPaymentRequest>({
    mutationFn: (body) => paymentApi.confirmPayment(body),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      void queryClient.invalidateQueries({
        queryKey: ['orders', 'detail', variables.orderId],
      });
    },
  });
}
