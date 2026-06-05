'use client';

import { useQuery } from '@tanstack/react-query';

import type { Product } from '@/types/product';
import { queryKeys } from '@/lib/queryKeys';
import { sellerProductApi } from '@/api/seller/products/sellerProductApi';

export function useSellerProduct(productId: string) {
  return useQuery<Product>({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => sellerProductApi.getProduct(productId),
    enabled: !!productId,
  });
}
