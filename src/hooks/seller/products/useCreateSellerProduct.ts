'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Product } from '@/types/product';
import type { CreateSellerProductRequest } from '@/contracts/product';
import { sellerProductApi } from '@/api/seller/products/sellerProductApi';

export function useCreateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, CreateSellerProductRequest>({
    mutationFn: (body) => sellerProductApi.createProduct(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['products', 'seller', 'list'],
      });
    },
  });
}
