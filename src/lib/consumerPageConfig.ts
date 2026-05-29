import type { ProductSortOptionId } from './consumerProductFilters';

interface ProductSortQuery {
  sort: 'endAt' | 'discountRate' | 'discountPrice';
  order: 'asc' | 'desc';
}

export const CONSUMER_REGION_ITEMS = [
  { label: '서울 강남구 역삼동', value: '서울 강남구' },
  { label: '서울 성동구 왕십리', value: '서울 성동구' },
  { label: '서울 마포구 합정동', value: '서울 마포구' },
];

export const CONSUMER_PRODUCTS_PER_PAGE = 10;

export function getProductSortQuery(
  sortOption: ProductSortOptionId
): ProductSortQuery {
  if (sortOption === 'discount-rate') {
    return { sort: 'discountRate' as const, order: 'desc' as const };
  }

  if (sortOption === 'price-low') {
    return { sort: 'discountPrice' as const, order: 'asc' as const };
  }

  return { sort: 'endAt' as const, order: 'asc' as const };
}
