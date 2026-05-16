import {
  ALL_CATEGORY_ID,
  type ProductFilterCategory,
} from '@/lib/consumerProductFilters';

export const mockConsumerProductCategories: ProductFilterCategory[] = [
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
