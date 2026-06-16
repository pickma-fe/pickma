'use client';

import { Button, Pagination } from '@/components/common';
import type { Product } from '@/types';

import { ProductCard } from './ProductCard';

interface ConsumerProductListProps {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onResetFilters?: () => void;
  isFiltered?: boolean;
  isLoading?: boolean;
}

export function ConsumerProductList({
  products,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
  onResetFilters,
  isFiltered,
  isLoading,
}: ConsumerProductListProps) {
  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(Math.max(currentPage, 1), totalPages);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">
          전체 상품 {isLoading ? 0 : totalCount}개
        </p>
      </div>

      {(() => {
        if (isLoading) {
          return (
            <div
              role="status"
              aria-live="polite"
              className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500"
            >
              상품을 불러오는 중입니다.
            </div>
          );
        }
        if (products.length > 0) {
          return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          );
        }
        return (
          <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-500">
              조건에 맞는 상품이 없습니다.
            </p>
            {onResetFilters && isFiltered && (
              <Button
                type="button"
                variant="outline"
                color="gray"
                onClick={onResetFilters}
              >
                필터 초기화
              </Button>
            )}
          </div>
        );
      })()}

      {!isLoading && (
        <div className="mt-8 flex justify-center">
          <Pagination
            totalPages={totalPages}
            currentPage={safeCurrentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
