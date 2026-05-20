'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useAcceptSellerOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => sellerOrderApi.acceptOrder(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ['seller', 'orders'] });
      void queryClient.invalidateQueries({
        queryKey: ['seller', 'orders', 'detail', id],
      });
    },
  });
}
