'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';

import type { PaginatedResult } from '@/types/common';
import type { Product, ProductListQuery } from '@/types/product';
import { queryKeys } from '@/lib/queryKeys';
import { productApi } from '@/api/products/productApi';

interface UseProductsOptions {
  enabled?: boolean;
  initialData?: PaginatedResult<Product>;
  keepPrevious?: boolean;
}

const INITIAL_PRODUCT_LIST_STALE_TIME_MS = 30_000;

export function useProducts(
  params: ProductListQuery,
  options?: UseProductsOptions
): UseQueryResult<PaginatedResult<Product>> {
  const hasInitialData = Boolean(options?.initialData);
  const [initialDataUpdatedAt] = useState<number | undefined>(() =>
    hasInitialData ? Date.now() : undefined
  );

  return useQuery<PaginatedResult<Product>>({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productApi.getProducts(params),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
    initialDataUpdatedAt,
    refetchOnMount: hasInitialData ? false : undefined,
    staleTime: hasInitialData ? INITIAL_PRODUCT_LIST_STALE_TIME_MS : 0,
    placeholderData: options?.keepPrevious ? keepPreviousData : undefined,
  });
}
