import type { CategoryResponse } from '@/contracts/category';

export const mockCategories: CategoryResponse[] = [
  {
    id: '00000000-0000-4000-8000-000000000011',
    name: '베이커리',
    icon: '🥖',
    sortOrder: 1,
  },
  {
    id: '00000000-0000-4000-8000-000000000012',
    name: '카페/음료',
    icon: '☕',
    sortOrder: 2,
  },
  {
    id: '00000000-0000-4000-8000-000000000013',
    name: '도시락',
    icon: '🍱',
    sortOrder: 3,
  },
  {
    id: '00000000-0000-4000-8000-000000000014',
    name: '샐러드',
    icon: '🥗',
    sortOrder: 4,
  },
  {
    id: '00000000-0000-4000-8000-000000000015',
    name: '분식',
    icon: '🍚',
    sortOrder: 5,
  },
  {
    id: '00000000-0000-4000-8000-000000000016',
    name: '디저트',
    icon: '🍰',
    sortOrder: 6,
  },
  {
    id: '00000000-0000-4000-8000-000000000017',
    name: '샌드위치',
    icon: '🥪',
    sortOrder: 7,
  },
];
