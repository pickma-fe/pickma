'use client';

import { useQuery } from '@tanstack/react-query';

import { mockMenuList, type MenuListResponse } from '@/mocks/menus';

export function useSellerMenus() {
  return useQuery<MenuListResponse>({
    queryKey: ['seller', 'menus'],
    queryFn: async () => {
      // TODO: API 연동 시 실제 API 호출로 교체
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockMenuList;
    },
  });
}
