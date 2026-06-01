export type PriceRangeId =
  | 'all'
  | 'under-10000'
  | '10000-20000'
  | '20000-30000'
  | 'over-30000';

export type PriceRangeOption = {
  id: PriceRangeId;
  label: string;
  minPrice?: number;
  maxPrice?: number;
};

export const priceRangeOptions: PriceRangeOption[] = [
  { id: 'all', label: '전체' },
  { id: 'under-10000', label: '1만원 미만', maxPrice: 10000 },
  {
    id: '10000-20000',
    label: '1만원 ~ 2만원',
    minPrice: 10000,
    maxPrice: 20000,
  },
  {
    id: '20000-30000',
    label: '2만원 ~ 3만원',
    minPrice: 20000,
    maxPrice: 30000,
  },
  { id: 'over-30000', label: '3만원 이상', minPrice: 30000 },
];

export function getPriceRange(priceRangeId: PriceRangeId): PriceRangeOption {
  return (
    priceRangeOptions.find((option) => option.id === priceRangeId) ??
    priceRangeOptions[0]
  );
}

export function getPriceRangeId(
  minPrice: number | undefined,
  maxPrice: number | undefined
): PriceRangeId {
  return (
    priceRangeOptions.find(
      (option) => option.minPrice === minPrice && option.maxPrice === maxPrice
    )?.id ?? 'all'
  );
}
