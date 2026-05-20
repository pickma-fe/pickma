import type { Category } from '@/types/category';
import type { CategoryListResponse } from '@/contracts/category';
import { apiClient } from '@/api/apiClient';

import { mapCategory } from './categoryMapper';

export const categoryApi = {
  getCategories(): Promise<Category[]> {
    return apiClient
      .get<CategoryListResponse>('/api/categories')
      .then((items) => items.map(mapCategory));
  },
};
