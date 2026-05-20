'use client';

import { use } from 'react';

import { useMenuStore } from '@/stores/menuStore';

import { MenuForm } from '../../_components/MenuForm';

interface MenuEditPageProps {
  params: Promise<{ menuId: string }>;
}

export default function MenuEditPage({ params }: MenuEditPageProps) {
  const { menuId } = use(params);
  const { menus } = useMenuStore();

  const menu = menus.find((m) => m.id === menuId);

  if (!menu) {
    return (
      <div className="p-8 text-center text-gray-500">
        메뉴를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          메뉴 수정
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          메뉴 정보를 수정할 수 있습니다.
        </p>
      </div>

      <MenuForm initialData={menu} isEdit />
    </div>
  );
}
