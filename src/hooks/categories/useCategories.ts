'use client';

import { useQuery } from '@tanstack/react-query';

import type { Category } from '@/types/category';
import { categoryApi } from '@/api/categories/categoryApi';

interface UseCategoriesOptions {
  initialData?: Category[];
}

export function useCategories(options?: UseCategoriesOptions) {
  return useQuery<Category[]>({
    queryKey: ['categories', 'list', 'all'],
    queryFn: () => categoryApi.getCategories(),
    initialData: options?.initialData,
  });
}
