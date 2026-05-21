'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { paymentApi } from '@/api/payments/paymentApi';

export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (paymentId) => paymentApi.cancelPayment(paymentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
    },
  });
}
