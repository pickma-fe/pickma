export const mockCategories: MockCategory[] = [
  {
    id: 'category-bakery',
    name: '베이커리',
    icon: '🥖',
  },
  {
    id: 'category-lunchbox-side',
    name: '도시락/반찬',
    icon: '🍱',
  },
  {
    id: 'category-salad',
    name: '샐러드',
    icon: '🥗',
  },
  {
    id: 'category-cafe-dessert',
    name: '카페/디저트',
    icon: '☕',
  },
  {
    id: 'category-snack',
    name: '분식',
    icon: '🍚',
  },
];

export interface MockCategory {
  id: string;
  name: string;
  icon: string | null;
}
