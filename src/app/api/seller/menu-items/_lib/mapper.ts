import type { MenuItemResponse } from '@/contracts/menu-item';

export type MenuItemRow = {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description: string | null;
  image: string | null;
  original_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  categories: {
    id: string;
    name: string;
  };
};

export function mapMenuItemRow(row: MenuItemRow): MenuItemResponse {
  return {
    id: row.id,
    storeId: row.store_id,
    categoryId: row.categories.id,
    categoryName: row.categories.name,
    name: row.name,
    ...(row.description !== null && { description: row.description }),
    ...(row.image !== null && { image: row.image }),
    originalPrice: row.original_price,
    status: row.status as 'active' | 'inactive',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
