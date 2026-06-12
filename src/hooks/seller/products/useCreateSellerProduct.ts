'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateSellerProductInput, Product } from '@/types/product';
import { queryKeys } from '@/lib/queryKeys';
import { sellerProductApi } from '@/api/seller/products/sellerProductApi';

export function useCreateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, CreateSellerProductInput>({
    mutationFn: (input) => sellerProductApi.createProduct(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.sellerList(),
      });
    },
  });
}
