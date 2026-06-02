'use client';

import type { Product } from '@/types/product';
import { Button, Pagination } from '@/components/common';

import { ProductCard } from './ProductCard';
import type { ResultViewMode } from './ResultViewToggle';
import { SearchProductListItem } from './SearchProductListItem';

interface SearchResultContentProps {
  hasKeyword: boolean;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  products: Product[];
  totalPages: number;
  currentPage: number;
  viewMode: ResultViewMode;
  onRetry: () => void;
  onPageChange: (page: number) => void;
}

export function SearchResultContent({
  hasKeyword,
  isLoading,
  isError,
  isFetching,
  products,
  totalPages,
  currentPage,
  viewMode,
  onRetry,
  onPageChange,
}: SearchResultContentProps) {
  if (!hasKeyword) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
        <p className="text-sm font-medium text-gray-500">
          검색어를 입력하면 마감 할인 상품을 찾아드릴게요.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
        검색 결과를 불러오는 중입니다.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-red-200 bg-red-50 px-4 text-center">
        <p className="text-sm font-semibold text-red-500">
          검색 결과를 불러오지 못했습니다.
        </p>
        <Button
          type="button"
          variant="outline"
          color="primary"
          disabled={isFetching}
          onClick={onRetry}
        >
          {isFetching ? '다시 불러오는 중' : '다시 시도'}
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
        <p className="text-sm font-medium text-gray-500">
          검색 조건에 맞는 상품이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <SearchProductListItem key={product.id} product={product} />
          ))}
        </div>
      )}
      <div className="mt-8 flex justify-center">
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}
