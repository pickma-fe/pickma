'use client';

import { Pagination } from '@/components/common';
import type { Product } from '@/types';

import { ProductCard } from './ProductCard';

interface ConsumerProductListProps {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ConsumerProductList({
  products,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
}: ConsumerProductListProps) {
  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(Math.max(currentPage, 1), totalPages);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">
          전체 상품 {totalCount}개
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {products.map((product) => (
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
