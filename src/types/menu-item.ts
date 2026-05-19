export type MenuItemStatus = 'active' | 'inactive';

export interface MenuItem {
  id: string;
  storeId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description?: string;
  image?: string;
  originalPrice: number;
  status: MenuItemStatus;
  createdAt: Date;
  updatedAt: Date;
}
