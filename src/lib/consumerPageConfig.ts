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
export const DEFAULT_HOME_PRODUCTS_PER_PAGE = 10;

export function getHomeProductsPageSizeForWidth(width: number): number {
  if (width >= 1536) {
    return 15;
  }

  if (width >= 1280) {
    return 12;
  }

  if (width >= 1024) {
    return 9;
  }

  if (width >= 640) {
    return 8;
  }

  return 6;
}

export function getHomeProductsPageSize(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_HOME_PRODUCTS_PER_PAGE;
  }

  return getHomeProductsPageSizeForWidth(window.innerWidth);
}

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
