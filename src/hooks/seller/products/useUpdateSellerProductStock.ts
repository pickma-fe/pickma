'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { sellerProductApi } from '@/api/seller/products/sellerProductApi';

interface UpdateStockVariables {
  id: string;
  stock: number;
}

export function useUpdateSellerProductStock() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateStockVariables>({
    mutationFn: ({ id, stock }) => sellerProductApi.updateStock(id, stock),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.sellerList(),
      });
    },
  });
}
