// src/stores/menuStore.ts

import { create } from 'zustand';

import { mockMenus, type MenuItemResponse } from '@/mocks/menus';

interface MenuStore {
  menus: MenuItemResponse[];
  addMenu: (
    menu: Omit<MenuItemResponse, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateMenu: (id: string, data: Partial<MenuItemResponse>) => void;
  deleteMenu: (id: string) => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  menus: mockMenus,

  addMenu: (menu) =>
    set((state) => ({
      menus: [
        ...state.menus,
        {
          ...menu,
          id: `menu-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateMenu: (id, data) =>
    set((state) => ({
      menus: state.menus.map((menu) =>
        menu.id === id
          ? { ...menu, ...data, updatedAt: new Date().toISOString() }
          : menu
      ),
    })),

  deleteMenu: (id) =>
    set((state) => ({
      menus: state.menus.filter((menu) => menu.id !== id),
    })),
}));
