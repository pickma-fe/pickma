import type { PaginatedResult } from '@/types/common';
import type { Product, ProductDetail, ProductListQuery } from '@/types/product';
import type {
  ProductDetailResponse,
  ProductListResponse,
} from '@/contracts/product';

import { apiClient } from '../apiClient';
import { mapProduct, mapProductDetail } from './productMapper';

export const productApi = {
  getProducts(query: ProductListQuery): Promise<PaginatedResult<Product>> {
    return apiClient
      .get<ProductListResponse>('/api/products', query)
      .then((res) => ({ ...res, items: res.items.map(mapProduct) }));
  },

  getProduct(id: string): Promise<ProductDetail> {
    return apiClient
      .get<ProductDetailResponse>(`/api/products/${id}`)
      .then(mapProductDetail);
  },
};
