'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Product, UpdateSellerProductInput } from '@/types/product';
import { queryKeys } from '@/lib/queryKeys';
import { sellerProductApi } from '@/api/seller/products/sellerProductApi';

interface UpdateSellerProductVariables {
  id: string;
  body: UpdateSellerProductInput;
}

export function useUpdateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, UpdateSellerProductVariables>({
    mutationFn: ({ id, body }) => sellerProductApi.updateProduct(id, body),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.sellerList(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(product.id),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.sellerDetail(product.id),
      });
    },
  });
}
