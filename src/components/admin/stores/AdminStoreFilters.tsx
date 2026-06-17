'use client';

import { RefreshCcw, Search } from 'lucide-react';

import type { StoreStatus } from '@/types/store';
import { Input } from '@/components/common/Input/Input';

import { STORE_STATUS_LABELS } from './adminStoreUtils';

interface AdminStoreFiltersProps {
  keyword: string;
  status: '' | StoreStatus;
  region: string;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: '' | StoreStatus) => void;
  onRegionChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function AdminStoreFilters({
  keyword,
  status,
  region,
  onKeywordChange,
  onStatusChange,
  onRegionChange,
  onSubmit,
  onReset,
}: AdminStoreFiltersProps) {
  return (
    <form
      className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_200px_auto_auto]"
      aria-label="관리자 가게 필터"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Input
        label="검색어"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="가게명, 사업자번호, 연락처, 주소 검색"
        aria-label="가게 검색"
        startIcon={<Search className="h-4 w-4" />}
      />
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">가게 상태</span>
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as '' | StoreStatus)
          }
          aria-label="가게 상태 선택"
          className="focus:border-primary-500 focus:ring-primary-300 h-11 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2"
        >
          <option value="">전체 가게 상태</option>
          {Object.entries(STORE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <Input
        label="지역"
        value={region}
        onChange={(event) => onRegionChange(event.target.value)}
        placeholder="지역 검색"
        aria-label="지역 검색"
      />
      <button
        type="submit"
        className="bg-primary-500 hover:bg-primary-600 focus-visible:ring-primary-500 inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        검색
      </button>
      <button
        type="button"
        onClick={onReset}
        className="focus-visible:ring-primary-500 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <RefreshCcw className="h-4 w-4" />
        초기화
      </button>
    </form>
  );
}
