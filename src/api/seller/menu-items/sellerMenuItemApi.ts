import type { MenuItem } from '@/types/menu-item';
import type {
  CreateMenuItemRequest,
  MenuItemResponse,
  SellerMenuItemListParams,
  UpdateMenuItemRequest,
} from '@/contracts/menu-item';
import { apiClient } from '@/api/apiClient';

import { mapMenuItem } from './sellerMenuItemMapper';

export const sellerMenuItemApi = {
  getMenuItems(params?: SellerMenuItemListParams): Promise<MenuItem[]> {
    return apiClient
      .get<MenuItemResponse[]>('/api/seller/menu-items', params)
      .then((items) => items.map(mapMenuItem));
  },

  createMenuItem(body: CreateMenuItemRequest): Promise<MenuItem> {
    return apiClient
      .post<MenuItemResponse>('/api/seller/menu-items', body)
      .then(mapMenuItem);
  },

  updateMenuItem(id: string, body: UpdateMenuItemRequest): Promise<MenuItem> {
    return apiClient
      .patch<MenuItemResponse>(`/api/seller/menu-items/${id}`, body)
      .then(mapMenuItem);
  },

  deleteMenuItem(id: string): Promise<void> {
    return apiClient
      .delete<null>(`/api/seller/menu-items/${id}`)
      .then(() => undefined);
  },
};
