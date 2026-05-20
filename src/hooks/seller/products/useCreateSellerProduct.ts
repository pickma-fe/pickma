'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateSellerProductInput, Product } from '@/types/product';
import type { CreateSellerProductRequest } from '@/contracts/product';
import { sellerProductApi } from '@/api/seller/products/sellerProductApi';

function toCreateSellerProductRequest(
  input: CreateSellerProductInput
): CreateSellerProductRequest {
  return { ...input, endAt: input.endAt.toISOString() };
}

export function useCreateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, CreateSellerProductInput>({
    mutationFn: (input) =>
      sellerProductApi.createProduct(toCreateSellerProductRequest(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['products', 'seller', 'list'],
      });
    },
  });
}
