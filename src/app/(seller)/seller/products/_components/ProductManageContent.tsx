'use client';

import { Package, ShoppingBag, PackageX, EyeOff } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Section } from '@/components/common/Section/Section';
import { mockProducts } from '@/mocks/products';

import { ProductFilter } from './ProductFilter';

export function ProductManageContent() {
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [detailFilter, setDetailFilter] = useState('전체');

  const categories = useMemo(() => {
    return [
      ...new Set(
        mockProducts
          .map((p) => p.categoryName ?? '')
          .filter((name) => name !== '')
      ),
    ];
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];

    if (selectedStatus !== '전체') {
      if (selectedStatus === '판매중') {
        result = result.filter((p) => p.status === 'active' && !p.isSoldOut);
      } else if (selectedStatus === '품절') {
        result = result.filter((p) => p.isSoldOut);
      } else if (selectedStatus === '판매중지') {
        result = result.filter((p) => p.status === 'closed');
      }
    }

    if (selectedCategory !== '전체') {
      result = result.filter((p) => p.categoryName === selectedCategory);
    }

    if (searchKeyword.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchKeyword.trim().toLowerCase())
      );
    }

    switch (detailFilter) {
      case 'in-stock':
        result = result.filter((p) => p.availableStock > 0);
        break;
      case 'low-stock':
        result = result.filter(
          (p) => p.availableStock > 0 && p.availableStock <= 5
        );
        break;
      case 'today-end':
        const today = new Date().toDateString();
        result = result.filter(
          (p) => new Date(p.endAt).toDateString() === today
        );
        break;
      case 'high-discount':
        result = result.filter((p) => p.discountRate >= 30);
        break;
    }

    switch (sortBy) {
      case 'latest':
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case 'oldest':
        result.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        break;
      case 'price-high':
        result.sort((a, b) => b.discountPrice - a.discountPrice);
        break;
      case 'price-low':
        result.sort((a, b) => a.discountPrice - b.discountPrice);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [selectedStatus, selectedCategory, searchKeyword, sortBy, detailFilter]);

  const totalCount = mockProducts.length;
  const activeCount = mockProducts.filter(
    (p) => p.status === 'active' && !p.isSoldOut
  ).length;
  const soldOutCount = mockProducts.filter((p) => p.isSoldOut).length;
  const closedCount = mockProducts.filter((p) => p.status === 'closed').length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          상품 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          등록한 상품을 관리하고, 판매 상태를 설정할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">전체 상품</p>
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
              <p className="text-sm text-gray-500">품절</p>
              <p className="text-2xl font-bold text-gray-900">
                {soldOutCount}
                <span className="text-base font-normal text-gray-500">개</span>
              </p>
            </div>
          </div>
        </Section>

        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <EyeOff className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">판매중지</p>
              <p className="text-2xl font-bold text-gray-900">
                {closedCount}
                <span className="text-base font-normal text-gray-500">개</span>
              </p>
            </div>
          </div>
        </Section>
      </div>

      <ProductFilter
        selectedStatus={selectedStatus}
        selectedCategory={selectedCategory}
        searchKeyword={searchKeyword}
        sortBy={sortBy}
        detailFilter={detailFilter}
        categories={categories}
        onStatusChange={setSelectedStatus}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchKeyword}
        onSortChange={setSortBy}
        onDetailFilterChange={setDetailFilter}
      />

      {/* TODO: 테이블 영역 (이슈 3) */}
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        <p>필터링된 상품: {filteredProducts.length}개</p>
        <p className="mt-2 text-sm">테이블 컴포넌트 구현 예정 (이슈 3)</p>
      </div>
    </div>
  );
}
