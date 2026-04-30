'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Product } from '@/types/product';
import type { UpdateSellerProductRequest } from '@/contracts/product';
import { sellerProductApi } from '@/api/seller/products/sellerProductApi';

interface UpdateSellerProductVariables {
  id: string;
  body: UpdateSellerProductRequest;
}

export function useUpdateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, UpdateSellerProductVariables>({
    mutationFn: ({ id, body }) => sellerProductApi.updateProduct(id, body),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({
        queryKey: ['products', 'seller', 'list'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['products', 'detail', product.id],
      });
    },
  });
}
