'use client';

import { useConsumerProducts } from '@/hooks/products/useConsumerProducts';
import { Pagination } from '@/components/common';
import type { Product } from '@/types';

import { ProductCard } from './ProductCard';

interface ConsumerProductListProps {
  products: Product[];
  selectedCategoryId: string;
  selectedSortOption: string;
  selectedDiscountOption: string;
  selectedRegion?: string;
  productRegions?: Record<string, string>;
  currentPage: number;
  productsPerPage: number;
  now: number;
  onPageChange: (page: number) => void;
}

export function ConsumerProductList({
  products,
  selectedCategoryId,
  selectedSortOption,
  selectedDiscountOption,
  selectedRegion,
  productRegions,
  currentPage,
  productsPerPage,
  now,
  onPageChange,
}: ConsumerProductListProps) {
  const {
    sortedProducts,
    paginatedProducts,
    totalPages,
    currentPage: safeCurrentPage,
  } = useConsumerProducts({
    products,
    selectedCategoryId,
    selectedSortOption,
    selectedDiscountOption,
    currentPage,
    productsPerPage,
    now,
    selectedRegion,
    productRegions,
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">
          전체 상품 {sortedProducts.length}개
        </p>
      </div>

      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
          조건에 맞는 상품이 없습니다.
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Pagination
          totalPages={totalPages}
          currentPage={safeCurrentPage}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}
