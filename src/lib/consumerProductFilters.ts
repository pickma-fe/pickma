export type ProductFilterCategory = {
  id: string;
  name: string;
  icon?: string;
};

export const ALL_CATEGORY_ID = 'category-all';
export const DEFAULT_SORT_OPTION_ID = 'deadline';
export const DEFAULT_DISCOUNT_OPTION_ID = 'all';

export const CONSUMER_PRODUCT_CATEGORIES: ProductFilterCategory[] = [
  { id: ALL_CATEGORY_ID, name: '전체', icon: '🔲' },
  {
    id: '00000000-0000-4000-8000-000000000201',
    name: '베이커리',
    icon: '🥖',
  },
  {
    id: '00000000-0000-4000-8000-000000000202',
    name: '샐러드',
    icon: '🥗',
  },
  {
    id: '00000000-0000-4000-8000-000000000203',
    name: '도시락',
    icon: '🍱',
  },
  {
    id: '00000000-0000-4000-8000-000000000204',
    name: '카페/음료',
    icon: '☕',
  },
  {
    id: '00000000-0000-4000-8000-000000000205',
    name: '분식',
    icon: '🍚',
  },
];

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
