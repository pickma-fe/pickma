import type { ProductDetail } from '@/types/product';
import type { ProductDetailResponse } from '@/contracts/product';

import { serverApiClient } from '../serverApiClient';
import { mapProductDetail } from './productMapper';

export const productServerApi = {
  getProduct(id: string): Promise<ProductDetail> {
    return serverApiClient
      .get<ProductDetailResponse>(`/api/products/${encodeURIComponent(id)}`)
      .then(mapProductDetail);
  },
};
