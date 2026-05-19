'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useMarkSellerOrderReady() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => sellerOrderApi.markOrderReady(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ['seller', 'orders'] });
      void queryClient.invalidateQueries({
        queryKey: ['seller', 'orders', 'detail', id],
      });
    },
  });
}
