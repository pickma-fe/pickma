export type ProductFilterCategory = {
  id: string;
  name: string;
  icon?: string;
};

export const DEFAULT_SORT_OPTION_ID = 'deadline';
export const DEFAULT_DISCOUNT_OPTION_ID = 'all';

const SORT_OPTION_IDS = ['deadline', 'discount-rate', 'price-low'] as const;
const DISCOUNT_OPTION_IDS = [
  'all',
  'over-40',
  '30-to-40',
  '20-to-30',
  'under-20',
] as const;

export type ProductSortOptionId = (typeof SORT_OPTION_IDS)[number];
export type ProductDiscountOptionId = (typeof DISCOUNT_OPTION_IDS)[number];

export function normalizeSortOptionId(
  sortOptionId: string
): ProductSortOptionId {
  if (isProductSortOptionId(sortOptionId)) {
    return sortOptionId;
  }

  return DEFAULT_SORT_OPTION_ID;
}

export function normalizeDiscountOptionId(
  discountOptionId: string
): ProductDiscountOptionId {
  if (isProductDiscountOptionId(discountOptionId)) {
    return discountOptionId;
  }

  return DEFAULT_DISCOUNT_OPTION_ID;
}

function isProductSortOptionId(
  sortOptionId: string
): sortOptionId is ProductSortOptionId {
  return SORT_OPTION_IDS.includes(sortOptionId as ProductSortOptionId);
}

function isProductDiscountOptionId(
  discountOptionId: string
): discountOptionId is ProductDiscountOptionId {
  return DISCOUNT_OPTION_IDS.includes(
    discountOptionId as ProductDiscountOptionId
  );
}
