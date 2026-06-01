'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';

import type { Category } from '@/types/category';
import { queryKeys } from '@/lib/queryKeys';
import { categoryApi } from '@/api/categories/categoryApi';

interface UseCategoriesOptions {
  initialData?: Category[];
}

// Categories change rarely, so SSR initial data can stay fresh longer than
// product stock/closing data.
const INITIAL_CATEGORY_LIST_STALE_TIME_MS = 5 * 60 * 1000;

export function useCategories(
  options?: UseCategoriesOptions
): UseQueryResult<Category[]> {
  const hasInitialData = Boolean(options?.initialData);
  const [initialDataUpdatedAt] = useState<number | undefined>(() =>
    hasInitialData ? Date.now() : undefined
  );

  return useQuery<Category[]>({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoryApi.getCategories(),
    initialData: options?.initialData,
    initialDataUpdatedAt,
    refetchOnMount: hasInitialData ? false : undefined,
    staleTime: hasInitialData ? INITIAL_CATEGORY_LIST_STALE_TIME_MS : 0,
  });
}
