'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateTargets } from '@/lib/queryKeys';
import { paymentApi } from '@/api/payments/paymentApi';

export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (paymentId) => paymentApi.cancelPayment(paymentId),
    onSuccess: () => {
      invalidateTargets.afterCancelPayment.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}
