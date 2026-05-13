'use client';

import { Package, ShoppingBag, PackageX } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

import { useMenuStore } from '@/stores/menuStore';
import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

import { MenuFilter } from './MenuFilter';
import { MenuTable } from './MenuTable';

export function MenuManageContent() {
  const { menus } = useMenuStore();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(menus.map((menu) => menu.category))];
    return ['전체', ...uniqueCategories];
  }, [menus]);

  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      const matchCategory =
        selectedCategory === '전체' || menu.category === selectedCategory;

      const matchSearch =
        searchKeyword === '' ||
        menu.name.toLowerCase().includes(searchKeyword.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [menus, selectedCategory, searchKeyword]);

  const totalCount = menus.length;
  const activeCount = totalCount;
  const inactiveCount = 0;

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

      <Section variant="card" className="bg-white">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
        </div>
      </Section>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <MenuFilter
          categories={categories}
          selectedCategory={selectedCategory}
          searchKeyword={searchKeyword}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchKeyword}
        />
        <Link href="/seller/menu/new">
          <Button>+ 메뉴 등록</Button>
        </Link>
      </div>

      <MenuTable menus={filteredMenus} />
    </div>
  );
}
