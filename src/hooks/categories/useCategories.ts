'use client';

import { useQuery } from '@tanstack/react-query';

import type { Category } from '@/types/category';
import { categoryApi } from '@/api/categories/categoryApi';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });
}
