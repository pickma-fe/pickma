export type ProductFilterCategory = {
  id: string;
  name: string;
  icon?: string;
};

export const ALL_CATEGORY_ID = 'category-all';
export const DEFAULT_SORT_OPTION_ID = 'ai-recommendation';
export const DEFAULT_DISCOUNT_OPTION_ID = 'all';

const SORT_OPTION_IDS = [
  'deadline',
  'discount-rate',
  'price-low',
  'distance',
  'ai-recommendation',
] as const;
const DISCOUNT_OPTION_IDS = [
  'all',
  'over-40',
  '30-to-40',
  '20-to-30',
  'under-20',
] as const;

export type ProductSortOptionId = (typeof SORT_OPTION_IDS)[number];
export type ProductDiscountOptionId = (typeof DISCOUNT_OPTION_IDS)[number];

export const SORT_OPTIONS: { id: ProductSortOptionId; label: string }[] = [
  { id: 'ai-recommendation', label: '추천순' },
  { id: 'deadline', label: '마감 임박순' },
  { id: 'discount-rate', label: '할인율 높은순' },
  { id: 'price-low', label: '가격 낮은순' },
  { id: 'distance', label: '거리순' },
];

export const DISCOUNT_OPTIONS: {
  id: ProductDiscountOptionId;
  label: string;
}[] = [
  { id: 'all', label: '전체' },
  { id: 'over-40', label: '40% 이상' },
  { id: '30-to-40', label: '30% ~ 40%' },
  { id: '20-to-30', label: '20% ~ 30%' },
  { id: 'under-20', label: '20% 미만' },
];

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
