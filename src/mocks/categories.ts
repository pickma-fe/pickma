import type { CategoryResponse } from '@/contracts/category';

export const mockCategories: CategoryResponse[] = [
  {
    id: '00000000-0000-4000-8000-000000000011',
    name: '베이커리',
    icon: 'bread',
    sortOrder: 1,
  },
  {
    id: '00000000-0000-4000-8000-000000000012',
    name: '카페/음료',
    icon: 'coffee',
    sortOrder: 2,
  },
  {
    id: '00000000-0000-4000-8000-000000000013',
    name: '도시락',
    icon: 'box',
    sortOrder: 3,
  },
  {
    id: '00000000-0000-4000-8000-000000000014',
    name: '샐러드',
    icon: 'salad',
    sortOrder: 4,
  },
  {
    id: '00000000-0000-4000-8000-000000000015',
    name: '분식',
    icon: 'food',
    sortOrder: 5,
  },
];
