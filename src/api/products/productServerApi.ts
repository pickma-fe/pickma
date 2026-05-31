import type { PaginatedResult } from '@/types/common';
import type { Product, ProductDetail } from '@/types/product';
import type {
  ProductDetailResponse,
  ProductListParams,
  ProductListResponse,
} from '@/contracts/product';

import { serverApiClient } from '../serverApiClient';
import { mapProduct, mapProductDetail } from './productMapper';

export const productServerApi = {
  getProducts(params: ProductListParams): Promise<PaginatedResult<Product>> {
    return serverApiClient
      .get<ProductListResponse>('/api/products', params)
      .then((res) => ({ ...res, items: res.items.map(mapProduct) }));
  },

  getProduct(id: string): Promise<ProductDetail> {
    return serverApiClient
      .get<ProductDetailResponse>(`/api/products/${encodeURIComponent(id)}`)
      .then(mapProductDetail);
  },
};
