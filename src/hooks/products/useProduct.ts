'use client';

import { useQuery } from '@tanstack/react-query';

import type { ProductDetail } from '@/types/product';
import { productApi } from '@/api/products/productApi';

export function useProduct(id: string) {
  return useQuery<ProductDetail>({
    queryKey: ['products', 'detail', id],
    queryFn: () => productApi.getProduct(id),
    enabled: Boolean(id),
  });
}
