'use client';

import { useQuery } from '@tanstack/react-query';

import type { ProductDetail } from '@/types/product';
import { productApi } from '@/api/products/productApi';

interface UseProductOptions {
  initialData?: ProductDetail;
}

export function useProduct(id: string, options: UseProductOptions = {}) {
  const initialData =
    options.initialData?.id === id ? options.initialData : undefined;

  return useQuery<ProductDetail>({
    queryKey: ['products', 'detail', id],
    queryFn: () => productApi.getProduct(id),
    enabled: Boolean(id),
    initialData,
  });
}
