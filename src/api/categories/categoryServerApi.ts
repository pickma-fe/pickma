import type { Category } from '@/types/category';
import type { CategoryListResponse } from '@/contracts/category';

import { serverApiClient } from '../serverApiClient';
import { mapCategory } from './categoryMapper';

export const categoryServerApi = {
  getCategories(): Promise<Category[]> {
    return serverApiClient
      .get<CategoryListResponse>('/api/categories')
      .then((items) => items.map(mapCategory));
  },
};
