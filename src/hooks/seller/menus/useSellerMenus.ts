import { mockMenuList } from '@/mocks/menus';

export function useSellerMenus() {
  // TODO: API 연동 시 React Query로 변경
  return {
    data: mockMenuList,
    isLoading: false,
    isError: false,
    error: null,
  };
}
