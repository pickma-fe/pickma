'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { sellerProductApi } from '@/api/seller/products/sellerProductApi';

export function useDeleteSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => sellerProductApi.deleteProduct(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.sellerList(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(id),
      });
    },
  });
}
