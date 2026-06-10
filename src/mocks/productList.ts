import type {
  ProductDiscountOption,
  ProductListItemResponse,
  ProductListParams,
  ProductListResponse,
} from '@/contracts/product';

import { mockProductList } from './products';

export function buildMockProductListResponse(
  params: ProductListParams,
  products: ProductListItemResponse[] = mockProductList.items
): ProductListResponse {
  const { page, pageSize, categoryId, keyword } = params;
  const discountOption = params.discountOption ?? 'all';
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const filteredProducts = products
    .filter((product) => product.status === 'active')
    .filter((product) => !params.availableOnly || isAvailableProduct(product))
    .filter((product) => !categoryId || product.categoryId === categoryId)
    .filter(
      (product) =>
        !keyword || product.name.toLowerCase().includes(keyword.toLowerCase())
    )
    .filter(
      (product) =>
        params.minPrice === undefined ||
        product.discountPrice >= params.minPrice
    )
    .filter(
      (product) =>
        params.maxPrice === undefined || product.discountPrice < params.maxPrice
    )
    .filter((product) => matchesDiscountOption(product, discountOption));
  const sortedProducts = [...filteredProducts].sort((a, b) =>
    compareProducts(a, b, params)
  );
  const totalCount = sortedProducts.length;

  return {
    items: sortedProducts.slice(from, to),
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

function isAvailableProduct(product: ProductListItemResponse): boolean {
  return (
    product.status === 'active' &&
    !product.isExpired &&
    new Date(product.endAt).getTime() > Date.now()
  );
}

function matchesDiscountOption(
  product: ProductListItemResponse,
  discountOption: ProductDiscountOption
): boolean {
  if (discountOption === 'all') {
    return true;
  }

  if (discountOption === 'over-40') {
    return product.discountRate >= 40;
  }

  if (discountOption === '30-to-40') {
    return product.discountRate >= 30 && product.discountRate < 40;
  }

  if (discountOption === '20-to-30') {
    return product.discountRate >= 20 && product.discountRate < 30;
  }

  if (discountOption === 'under-20') {
    return product.discountRate < 20;
  }

  return true;
}

function compareProducts(
  a: ProductListItemResponse,
  b: ProductListItemResponse,
  params: ProductListParams
): number {
  const sort = params.sort ?? 'endAt';
  const direction = getSortOrder(params) === 'asc' ? 1 : -1;

  if (
    sort === 'distance' &&
    params.userLat !== undefined &&
    params.userLng !== undefined
  ) {
    return (
      ((a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)) * direction
    );
  }

  if (sort === 'discountRate') {
    return (a.discountRate - b.discountRate) * direction;
  }

  if (sort === 'discountPrice') {
    return (a.discountPrice - b.discountPrice) * direction;
  }

  return (
    (new Date(a.endAt).getTime() - new Date(b.endAt).getTime()) * direction
  );
}

function getSortOrder(params: ProductListParams): 'asc' | 'desc' {
  return params.order ?? 'asc';
}
