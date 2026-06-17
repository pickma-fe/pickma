'use client';

import { CalendarDays, RefreshCcw, Search, Tags } from 'lucide-react';

import { Input } from '@/components/common/Input/Input';

interface AdminSellerApprovalFiltersProps {
  searchKeyword: string;
  selectedDate: string;
  businessCategory: string;
  onSearchKeywordChange: (value: string) => void;
  onSelectedDateChange: (value: string) => void;
  onBusinessCategoryChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function AdminSellerApprovalFilters({
  searchKeyword,
  selectedDate,
  businessCategory,
  onSearchKeywordChange,
  onSelectedDateChange,
  onBusinessCategoryChange,
  onSubmit,
  onReset,
}: AdminSellerApprovalFiltersProps) {
  return (
    <form
      className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto_auto]"
      aria-label="판매자 승인 필터"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Input
        label="검색어"
        value={searchKeyword}
        onChange={(event) => onSearchKeywordChange(event.target.value)}
        placeholder="상호명, 대표자명, 이메일, 전화번호 검색"
        aria-label="판매자 신청 검색"
        startIcon={<Search className="h-4 w-4" />}
      />
      <Input
        label="신청일"
        type="date"
        value={selectedDate}
        onChange={(event) => onSelectedDateChange(event.target.value)}
        aria-label="신청일 선택"
        endIcon={<CalendarDays className="h-4 w-4" />}
      />
      <Input
        label="업종"
        value={businessCategory}
        onChange={(event) => onBusinessCategoryChange(event.target.value)}
        placeholder="업종 검색"
        aria-label="업종 검색"
        startIcon={<Tags className="h-4 w-4" />}
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
