'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';

import type { PaginatedResult } from '@/types/common';
import type { Product } from '@/types/product';
import type { ProductListParams } from '@/contracts/product';
import { productApi } from '@/api/products/productApi';

interface UseProductsOptions {
  initialData?: PaginatedResult<Product>;
}

const INITIAL_PRODUCT_LIST_STALE_TIME_MS = 30_000;

export function useProducts(
  params: ProductListParams,
  options?: UseProductsOptions
): UseQueryResult<PaginatedResult<Product>> {
  const hasInitialData = Boolean(options?.initialData);
  const [initialDataUpdatedAt] = useState<number | undefined>(() =>
    hasInitialData ? Date.now() : undefined
  );

  return useQuery<PaginatedResult<Product>>({
    queryKey: ['products', 'list', params],
    queryFn: () => productApi.getProducts(params),
    initialData: options?.initialData,
    initialDataUpdatedAt,
    refetchOnMount: hasInitialData ? false : undefined,
    staleTime: hasInitialData ? INITIAL_PRODUCT_LIST_STALE_TIME_MS : 0,
  });
}
