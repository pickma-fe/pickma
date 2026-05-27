'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { Product } from '@/types/product';
import type { ProductListParams } from '@/contracts/product';
import { productApi } from '@/api/products/productApi';

interface UseProductsOptions {
  initialData?: PaginatedResult<Product>;
}

export function useProducts(
  params: ProductListParams,
  options?: UseProductsOptions
) {
  return useQuery<PaginatedResult<Product>>({
    queryKey: ['products', 'list', params],
    queryFn: () => productApi.getProducts(params),
    initialData: options?.initialData,
  });
}
