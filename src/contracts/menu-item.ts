export type MenuItemStatus = 'active' | 'inactive';

export interface SellerMenuItemListParams {
  categoryId?: string;
  keyword?: string;
  status?: MenuItemStatus;
}

export interface MenuItemResponse {
  id: string;
  storeId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description?: string;
  image?: string;
  originalPrice: number;
  status: MenuItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemRequest {
  categoryId: string;
  name: string;
  description?: string;
  image?: string;
  originalPrice: number;
}

export interface UpdateMenuItemRequest {
  categoryId?: string;
  name?: string;
  description?: string;
  image?: string;
  originalPrice?: number;
  status?: MenuItemStatus;
}
