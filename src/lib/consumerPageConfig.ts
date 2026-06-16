import type { ProductSortOptionId } from './consumerProductFilters';

type ProductSortQuery =
  | {
      sort:
        | 'endAt'
        | 'discountRate'
        | 'discountPrice'
        | 'popular'
        | 'aiRecommendation';
      order?: 'asc' | 'desc';
    }
  | { sort: 'distance' };

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

  if (sortOption === 'distance') {
    return { sort: 'distance' as const };
  }

  if (sortOption === 'ai-recommendation') {
    return { sort: 'aiRecommendation' as const };
  }

  return { sort: 'endAt' as const, order: 'asc' as const };
}
