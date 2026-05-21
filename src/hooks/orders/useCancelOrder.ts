'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { orderApi } from '@/api/orders/orderApi';

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (orderId) => orderApi.cancelOrder(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
    },
  });
}
