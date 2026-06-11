import type {
  CreateMenuItemInput,
  MenuItem,
  SellerMenuItemListQuery,
  UpdateMenuItemInput,
} from '@/types/menu-item';
import type {
  CreateMenuItemRequest,
  MenuItemResponse,
  SellerMenuItemListParams,
  UpdateMenuItemRequest,
} from '@/contracts/menu-item';
import { apiClient } from '@/api/apiClient';

import { mapMenuItem } from './sellerMenuItemMapper';

function toSellerMenuItemListParams(
  query?: SellerMenuItemListQuery
): SellerMenuItemListParams | undefined {
  return query ? { ...query } : undefined;
}

function toCreateMenuItemRequest(
  input: CreateMenuItemInput
): CreateMenuItemRequest {
  return { ...input };
}

function toUpdateMenuItemRequest(
  input: UpdateMenuItemInput
): UpdateMenuItemRequest {
  return { ...input };
}

export const sellerMenuItemApi = {
  getMenuItems(query?: SellerMenuItemListQuery): Promise<MenuItem[]> {
    return apiClient
      .get<
        MenuItemResponse[]
      >('/api/seller/menu-items', toSellerMenuItemListParams(query))
      .then((items) => items.map(mapMenuItem));
  },

  createMenuItem(input: CreateMenuItemInput): Promise<MenuItem> {
    return apiClient
      .post<MenuItemResponse>(
        '/api/seller/menu-items',
        toCreateMenuItemRequest(input)
      )
      .then(mapMenuItem);
  },

  updateMenuItem(id: string, input: UpdateMenuItemInput): Promise<MenuItem> {
    return apiClient
      .patch<MenuItemResponse>(
        `/api/seller/menu-items/${id}`,
        toUpdateMenuItemRequest(input)
      )
      .then(mapMenuItem);
  },

  deleteMenuItem(id: string): Promise<void> {
    return apiClient
      .delete<null>(`/api/seller/menu-items/${id}`)
      .then(() => undefined);
  },
};
