import type { CategoryResponse } from '@/contracts/category';

export const mockCategories: CategoryResponse[] = [
  { id: 'cat_1', name: '베이커리', icon: 'bread', sortOrder: 1 },
  { id: 'cat_2', name: '카페/음료', icon: 'coffee', sortOrder: 2 },
  { id: 'cat_3', name: '도시락', icon: 'box', sortOrder: 3 },
  { id: 'cat_4', name: '샐러드', icon: 'salad', sortOrder: 4 },
  { id: 'cat_5', name: '분식', icon: 'food', sortOrder: 5 },
];
