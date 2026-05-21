'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sellerOrderApi } from '@/api/seller/orders/sellerOrderApi';

export function useCompleteSellerOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => sellerOrderApi.completeOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seller', 'orders'] });
    },
  });
}
