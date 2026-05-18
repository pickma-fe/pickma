'use client';

import { useQuery } from '@tanstack/react-query';

import type { MenuItem } from '@/types/menu-item';
import type { SellerMenuItemListParams } from '@/contracts/menu-item';
import { sellerMenuItemApi } from '@/api/seller/menu-items/sellerMenuItemApi';

export function useSellerMenuItems(params?: SellerMenuItemListParams) {
  return useQuery<MenuItem[]>({
    queryKey: ['seller', 'menu-items', 'list', params ?? {}],
    queryFn: () => sellerMenuItemApi.getMenuItems(params),
  });
}
