'use client';

import { useMemo, useState } from 'react';

import type { ProductStatus } from '@/types/product';
import {
  type AdminProductsQuery,
  useAdminProducts,
} from '@/hooks/admin/products/useAdminProducts';
import { Button } from '@/components/common/Button/Button';

import { AdminProductFilters } from './AdminProductFilters';
import { AdminProductTable } from './AdminProductTable';

const PAGE_SIZE = 10;

export function AdminProductsPageContent() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'' | ProductStatus>('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [submittedStatus, setSubmittedStatus] = useState<'' | ProductStatus>(
    ''
  );
  const trimmedSubmittedKeyword = submittedKeyword.trim();

  const query = useMemo<AdminProductsQuery>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(trimmedSubmittedKeyword.length > 0 && {
        keyword: trimmedSubmittedKeyword,
      }),
      ...(submittedStatus && { status: submittedStatus }),
    }),
    [page, submittedStatus, trimmedSubmittedKeyword]
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useAdminProducts(query);
  const products = data?.items ?? [];
  const hasSubmittedFilters =
    trimmedSubmittedKeyword.length > 0 || Boolean(submittedStatus);
  const countLabel = hasSubmittedFilters ? '조건에 맞는 상품' : '전체 상품';

  function submitFilters() {
    setSubmittedKeyword(keyword);
    setSubmittedStatus(status);
    setPage(1);
  }

  function resetFilters() {
    setKeyword('');
    setStatus('');
    setSubmittedKeyword('');
    setSubmittedStatus('');
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
        <p className="mt-2 text-sm text-gray-500">
          플랫폼 전체 상품의 가격, 재고, 판매 상태를 확인할 수 있습니다.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">
          {countLabel} {data?.totalCount ?? 0}건
        </p>
      </section>

      <AdminProductFilters
        keyword={keyword}
        status={status}
        onKeywordChange={setKeyword}
        onStatusChange={setStatus}
        onSubmit={submitFilters}
        onReset={resetFilters}
      />

      {isError ? (
        <div
          role="alert"
          className="rounded-md border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700"
        >
          <p className="font-medium">상품 목록을 불러오지 못했습니다.</p>
          <Button
            variant="outline"
            color="danger"
            className="mt-3 h-9 px-3 text-xs"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            다시 시도
          </Button>
        </div>
      ) : (
        <AdminProductTable
          products={products}
          isLoading={isLoading}
          currentPage={data?.page ?? page}
          totalPages={data?.totalPages ?? 0}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
