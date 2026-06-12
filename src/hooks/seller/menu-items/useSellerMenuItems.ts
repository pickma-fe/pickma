'use client';

import { useQuery } from '@tanstack/react-query';

import type { MenuItem, SellerMenuItemListQuery } from '@/types/menu-item';
import { queryKeys } from '@/lib/queryKeys';
import { sellerMenuItemApi } from '@/api/seller/menu-items/sellerMenuItemApi';

export function useSellerMenuItems(params?: SellerMenuItemListQuery) {
  return useQuery<MenuItem[]>({
    queryKey: queryKeys.sellers.menuItems.list(params ?? {}),
    queryFn: () => sellerMenuItemApi.getMenuItems(params),
  });
}
