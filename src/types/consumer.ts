export type ProductFilterCategory = {
  id: string;
  name: string;
  icon?: string;
};

export const DEFAULT_SORT_OPTION_ID = 'deadline';
export const DEFAULT_DISCOUNT_OPTION_ID = 'all';

export type ProductSortOptionId = 'deadline' | 'discount-rate' | 'price-low';

export type ProductDiscountOptionId =
  | 'all'
  | 'over-40'
  | '30-to-40'
  | '20-to-30'
  | 'under-20';

export function normalizeSortOptionId(
  sortOptionId: string
): ProductSortOptionId {
  if (
    sortOptionId === 'deadline' ||
    sortOptionId === 'discount-rate' ||
    sortOptionId === 'price-low'
  ) {
    return sortOptionId;
  }

  return DEFAULT_SORT_OPTION_ID;
}

export function normalizeDiscountOptionId(
  discountOptionId: string
): ProductDiscountOptionId {
  if (
    discountOptionId === 'all' ||
    discountOptionId === 'over-40' ||
    discountOptionId === '30-to-40' ||
    discountOptionId === '20-to-30' ||
    discountOptionId === 'under-20'
  ) {
    return discountOptionId;
  }

  return DEFAULT_DISCOUNT_OPTION_ID;
}
