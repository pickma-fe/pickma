'use client';

import { Package, ShoppingBag, PackageX } from 'lucide-react';
import { useState } from 'react';

import { useSellerMenus } from '@/hooks/seller/menus/useSellerMenus';
import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

import { MenuFilter } from './MenuFilter';
import { MenuTable } from './MenuTable';

export function MenuManageContent() {
  const { data, isLoading, isError } = useSellerMenus();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const menus = data?.items ?? [];

  const categories = ['전체', ...new Set(menus.map((menu) => menu.category))];

  const filteredMenus = menus.filter((menu) => {
    const matchCategory =
      selectedCategory === '전체' || menu.category === selectedCategory;

    const matchSearch =
      searchKeyword === '' ||
      menu.name.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchCategory && matchSearch;
  });

  const totalCount = menus.length;
  const activeCount = menus.filter((menu) => menu.status === 'active').length;
  const inactiveCount = menus.filter(
    (menu) => menu.status === 'inactive'
  ).length;

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const handleAddMenu = () => {
    // TODO: 메뉴 등록 페이지 이동
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-red-600">
          메뉴 목록을 불러오는데 실패했습니다.
        </p>
        <p className="mt-2 text-xs text-gray-500">잠시 후 다시 시도해주세요.</p>
      </div>
    );
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
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
        />
        <Button onClick={handleAddMenu}>+ 메뉴 등록</Button>
      </div>

      <MenuTable
        menus={filteredMenus}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
