import type { PaginatedResult } from '@/types/common';
import type { Product } from '@/types/product';
import type {
  AdminProductListQuery,
  AdminProductListResponse,
} from '@/contracts/admin';
import { apiClient } from '@/api/apiClient';
import { mapProduct } from '@/api/products/productMapper';

export const adminProductApi = {
  getProducts(
    params: AdminProductListQuery = {}
  ): Promise<PaginatedResult<Product>> {
    return apiClient
      .get<AdminProductListResponse>('/api/admin/products', params)
      .then((res) => ({ ...res, items: res.items.map(mapProduct) }));
  },
};
