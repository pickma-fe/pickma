'use client';

import { useQuery } from '@tanstack/react-query';

import type { Product } from '@/types/product';
import { sellerProductApi } from '@/api/seller/products/sellerProductApi';

export function useSellerProducts() {
  return useQuery<Product[]>({
    queryKey: ['seller', 'products', 'list'],
    queryFn: () => sellerProductApi.getProducts(),
  });
}
