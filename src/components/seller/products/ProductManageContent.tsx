'use client';

import { Package, ShoppingBag, PackageX, EyeOff } from 'lucide-react';
import { useState, useMemo } from 'react';

import { useSellerProducts } from '@/hooks/seller/products/useSellerProducts';
import { Section } from '@/components/common/Section/Section';

import { ProductFilter } from './ProductFilter';
import { ProductTable } from './ProductTable';

export function ProductManageContent() {
  const { data: productsData, isLoading, isError } = useSellerProducts();
  const products = useMemo(() => productsData ?? [], [productsData]);
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [detailFilter, setDetailFilter] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    return [
      ...new Set(
        products.map((p) => p.categoryName ?? '').filter((name) => name !== '')
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

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
      case 'today-end': {
        const today = new Date().toDateString();
        result = result.filter((p) => p.endAt.toDateString() === today);
        break;
      }
      case 'high-discount':
        result = result.filter((p) => p.discountRate >= 30);
        break;
    }

    switch (sortBy) {
      case 'latest':
        result.sort(
          (a, b) =>
            (b.updatedAt ?? new Date(0)).getTime() -
            (a.updatedAt ?? new Date(0)).getTime()
        );
        break;
      case 'oldest':
        result.sort(
          (a, b) =>
            (a.updatedAt ?? new Date(0)).getTime() -
            (b.updatedAt ?? new Date(0)).getTime()
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
  }, [
    products,
    selectedStatus,
    selectedCategory,
    searchKeyword,
    sortBy,
    detailFilter,
  ]);

  const totalCount = products.length;
  const activeCount = products.filter(
    (p) => p.status === 'active' && !p.isSoldOut
  ).length;
  const soldOutCount = products.filter((p) => p.isSoldOut).length;
  const closedCount = products.filter((p) => p.status === 'closed').length;

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleDetailFilterChange = (filter: string) => {
    setDetailFilter(filter);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-gray-500">
        상품을 불러오는 중입니다.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-red-500">
        상품을 불러오지 못했습니다.
      </div>
    );
  }

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
        <Section variant="card">
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

        <Section variant="card">
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

        <Section variant="card">
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

        <Section variant="card">
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
        onStatusChange={handleStatusChange}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onDetailFilterChange={handleDetailFilterChange}
      />

      <ProductTable
        products={filteredProducts}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
