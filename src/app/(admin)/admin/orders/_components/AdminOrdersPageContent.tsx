'use client';

import { useMemo, useState } from 'react';

import {
  type AdminOrdersQuery,
  useAdminOrders,
} from '@/hooks/admin/orders/useAdminOrders';
import { Button } from '@/components/common/Button/Button';

import { AdminOrderFilters } from './AdminOrderFilters';
import { AdminOrderTable } from './AdminOrderTable';

const PAGE_SIZE = 10;

type AdminOrderStatusFilter = '' | NonNullable<AdminOrdersQuery['status']>;

export function AdminOrdersPageContent() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<AdminOrderStatusFilter>('');
  const [sort, setSort] =
    useState<NonNullable<AdminOrdersQuery['sort']>>('createdAt');
  const [order, setOrder] =
    useState<NonNullable<AdminOrdersQuery['order']>>('desc');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [submittedStatus, setSubmittedStatus] =
    useState<AdminOrderStatusFilter>('');
  const [submittedSort, setSubmittedSort] =
    useState<NonNullable<AdminOrdersQuery['sort']>>('createdAt');
  const [submittedOrder, setSubmittedOrder] =
    useState<NonNullable<AdminOrdersQuery['order']>>('desc');
  const trimmedSubmittedKeyword = submittedKeyword.trim();

  const query = useMemo<AdminOrdersQuery>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sort: submittedSort,
      order: submittedOrder,
      ...(trimmedSubmittedKeyword.length > 0 && {
        keyword: trimmedSubmittedKeyword,
      }),
      ...(submittedStatus && { status: submittedStatus }),
    }),
    [
      page,
      submittedOrder,
      submittedSort,
      submittedStatus,
      trimmedSubmittedKeyword,
    ]
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useAdminOrders(query);
  const orders = data?.items ?? [];
  const hasSubmittedFilters =
    trimmedSubmittedKeyword.length > 0 || Boolean(submittedStatus);
  const countLabel = hasSubmittedFilters ? '조건에 맞는 주문' : '전체 주문';

  function submitFilters() {
    setSubmittedKeyword(keyword);
    setSubmittedStatus(status);
    setSubmittedSort(sort);
    setSubmittedOrder(order);
    setPage(1);
  }

  function resetFilters() {
    setKeyword('');
    setStatus('');
    setSort('createdAt');
    setOrder('desc');
    setSubmittedKeyword('');
    setSubmittedStatus('');
    setSubmittedSort('createdAt');
    setSubmittedOrder('desc');
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">주문 관리</h1>
        <p className="mt-2 text-sm text-gray-500">
          플랫폼 전체 주문과 처리 상태를 확인할 수 있습니다.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">
          {countLabel} {data?.totalCount ?? 0}건
        </p>
      </section>

      <AdminOrderFilters
        keyword={keyword}
        status={status}
        sort={sort}
        order={order}
        onKeywordChange={setKeyword}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onOrderChange={setOrder}
        onSubmit={submitFilters}
        onReset={resetFilters}
      />

      {isError ? (
        <div
          role="alert"
          className="rounded-md border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700"
        >
          <p className="font-medium">주문 목록을 불러오지 못했습니다.</p>
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
        <AdminOrderTable
          orders={orders}
          isLoading={isLoading}
          currentPage={data?.page ?? page}
          totalPages={data?.totalPages ?? 0}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
