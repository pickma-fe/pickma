'use client';

import { RefreshCcw, Search } from 'lucide-react';

import type { AdminOrdersQuery } from '@/hooks/admin/orders/useAdminOrders';
import { Input } from '@/components/common/Input/Input';

import {
  ORDER_STATUS_QUERY_LABELS,
  ORDER_STATUS_QUERY_VALUES,
} from './adminOrderUtils';

type AdminOrderStatusFilter = '' | NonNullable<AdminOrdersQuery['status']>;

interface AdminOrderFiltersProps {
  keyword: string;
  status: AdminOrderStatusFilter;
  sort: NonNullable<AdminOrdersQuery['sort']>;
  order: NonNullable<AdminOrdersQuery['order']>;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: AdminOrderStatusFilter) => void;
  onSortChange: (value: NonNullable<AdminOrdersQuery['sort']>) => void;
  onOrderChange: (value: NonNullable<AdminOrdersQuery['order']>) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function AdminOrderFilters({
  keyword,
  status,
  sort,
  order,
  onKeywordChange,
  onStatusChange,
  onSortChange,
  onOrderChange,
  onSubmit,
  onReset,
}: AdminOrderFiltersProps) {
  return (
    <form
      className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_160px_140px_auto_auto]"
      aria-label="관리자 주문 필터"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Input
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="주문번호, 픽업번호 검색"
        aria-label="주문 검색"
        startIcon={<Search className="h-4 w-4" />}
      />
      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as AdminOrderStatusFilter)
        }
        aria-label="주문 상태 선택"
        className="focus:border-primary-500 focus:ring-primary-300 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2"
      >
        <option value="">전체 주문 상태</option>
        {ORDER_STATUS_QUERY_VALUES.map((value) => (
          <option key={value} value={value}>
            {ORDER_STATUS_QUERY_LABELS[value]}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(event) =>
          onSortChange(
            event.target.value as NonNullable<AdminOrdersQuery['sort']>
          )
        }
        aria-label="정렬 기준 선택"
        className="focus:border-primary-500 focus:ring-primary-300 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2"
      >
        <option value="createdAt">주문일</option>
        <option value="pickupAt">픽업일</option>
      </select>
      <select
        value={order}
        onChange={(event) =>
          onOrderChange(
            event.target.value as NonNullable<AdminOrdersQuery['order']>
          )
        }
        aria-label="정렬 방향 선택"
        className="focus:border-primary-500 focus:ring-primary-300 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2"
      >
        <option value="desc">내림차순</option>
        <option value="asc">오름차순</option>
      </select>
      <button
        type="submit"
        className="bg-primary-500 hover:bg-primary-600 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-white"
      >
        검색
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        <RefreshCcw className="h-4 w-4" />
        초기화
      </button>
    </form>
  );
}
