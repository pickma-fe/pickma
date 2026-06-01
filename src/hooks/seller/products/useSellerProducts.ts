'use client';

import { useQuery } from '@tanstack/react-query';

import type { Product } from '@/types/product';
import { queryKeys } from '@/lib/queryKeys';
import { sellerProductApi } from '@/api/seller/products/sellerProductApi';

export function useSellerProducts() {
  return useQuery<Product[]>({
    queryKey: queryKeys.products.sellerList(),
    queryFn: () => sellerProductApi.getProducts(),
  });
}
