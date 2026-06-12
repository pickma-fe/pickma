import type { PaginatedResult } from '@/types/common';
import type {
  Product,
  ProductDetail,
  ProductDiscountOption,
  ProductListQuery,
} from '@/types/product';
import type {
  ProductDetailResponse,
  ProductListParams,
  ProductListResponse,
} from '@/contracts/product';

import { apiClient } from '../apiClient';
import { mapProduct, mapProductDetail } from './productMapper';

const PRODUCT_DISCOUNT_OPTION_TO_PARAM = {
  all: 'all',
  'over-40': 'over-40',
  '30-to-40': '30-to-40',
  '20-to-30': '20-to-30',
  'under-20': 'under-20',
} satisfies Record<ProductDiscountOption, ProductListParams['discountOption']>;

function toProductListParams(query: ProductListQuery): ProductListParams {
  return {
    page: query.page,
    pageSize: query.pageSize,
    userLat: query.userLat,
    userLng: query.userLng,
    categoryId: query.categoryId,
    keyword: query.keyword,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    discountOption: query.discountOption
      ? PRODUCT_DISCOUNT_OPTION_TO_PARAM[query.discountOption]
      : undefined,
    sort: query.sort,
    order: query.order,
    availableOnly: query.availableOnly,
  };
}

export const productApi = {
  getProducts(query: ProductListQuery): Promise<PaginatedResult<Product>> {
    return apiClient
      .get<ProductListResponse>('/api/products', toProductListParams(query))
      .then((res) => ({ ...res, items: res.items.map(mapProduct) }));
  },

  getProduct(id: string): Promise<ProductDetail> {
    return apiClient
      .get<ProductDetailResponse>(`/api/products/${id}`)
      .then(mapProductDetail);
  },
};
