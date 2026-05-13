'use client';

import { Package, ShoppingBag, PackageX } from 'lucide-react';

import { useSellerMenus } from '@/hooks/seller/menus/useSellerMenus';
import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

import { MenuTable } from './MenuTable';

export function MenuManageContent() {
  const { data, isLoading } = useSellerMenus();

  const menus = data?.items ?? [];
  const totalCount = menus.length;
  const activeCount = totalCount;
  const inactiveCount = 0;

  const handleAddMenu = () => {
    // TODO: 메뉴 등록 페이지 이동
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          메뉴 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          등록한 메뉴를 확인하고 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">전체 메뉴</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCount}
                <span className="text-base font-normal text-gray-500">개</span>
              </p>
            </div>
          </div>
        </Section>

        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">판매중</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeCount}
                <span className="text-base font-normal text-gray-500">개</span>
              </p>
            </div>
          </div>
        </Section>

        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <PackageX className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">판매중지</p>
              <p className="text-2xl font-bold text-gray-900">
                {inactiveCount}
                <span className="text-base font-normal text-gray-500">개</span>
              </p>
            </div>
          </div>
        </Section>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleAddMenu}>+ 메뉴 등록</Button>
      </div>

      <MenuTable menus={menus} />
    </div>
  );
}
