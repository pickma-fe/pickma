'use client';

import { RefreshCcw, Search } from 'lucide-react';

import type { ProductStatus } from '@/types/product';
import { Input } from '@/components/common/Input/Input';

import { PRODUCT_STATUS_LABELS } from './adminProductUtils';

interface AdminProductFiltersProps {
  keyword: string;
  status: '' | ProductStatus;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: '' | ProductStatus) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function AdminProductFilters({
  keyword,
  status,
  onKeywordChange,
  onStatusChange,
  onSubmit,
  onReset,
}: AdminProductFiltersProps) {
  return (
    <form
      className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto_auto]"
      aria-label="관리자 상품 필터"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Input
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="상품명, 가게명 검색"
        aria-label="상품 검색"
        startIcon={<Search className="h-4 w-4" />}
      />
      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as '' | ProductStatus)
        }
        aria-label="상품 상태 선택"
        className="focus:border-primary-500 focus:ring-primary-300 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2"
      >
        <option value="">전체 상품 상태</option>
        {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
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
