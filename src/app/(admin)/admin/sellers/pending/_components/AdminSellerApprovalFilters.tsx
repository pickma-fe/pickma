'use client';

import { CalendarDays, RefreshCcw, Search } from 'lucide-react';

import { Input } from '@/components/common/Input/Input';

interface AdminSellerApprovalFiltersProps {
  searchKeyword: string;
  selectedDate: string;
  selectedCategory: string;
  categories: string[];
  onSearchKeywordChange: (value: string) => void;
  onSelectedDateChange: (value: string) => void;
  onSelectedCategoryChange: (value: string) => void;
  onReset: () => void;
}

export function AdminSellerApprovalFilters({
  searchKeyword,
  selectedDate,
  selectedCategory,
  categories,
  onSearchKeywordChange,
  onSelectedDateChange,
  onSelectedCategoryChange,
  onReset,
}: AdminSellerApprovalFiltersProps) {
  return (
    <section
      className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]"
      aria-label="판매자 승인 필터"
    >
      <Input
        value={searchKeyword}
        onChange={(event) => onSearchKeywordChange(event.target.value)}
        placeholder="상호명, 대표자명, 이메일, 전화번호 검색"
        aria-label="판매자 신청 검색"
        startIcon={<Search className="h-4 w-4" />}
      />
      <Input
        type="date"
        value={selectedDate}
        onChange={(event) => onSelectedDateChange(event.target.value)}
        aria-label="신청일 선택"
        endIcon={<CalendarDays className="h-4 w-4" />}
      />
      <select
        value={selectedCategory}
        onChange={(event) => onSelectedCategoryChange(event.target.value)}
        aria-label="업종 선택"
        className="focus:border-primary-500 focus:ring-primary-300 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2"
      >
        <option value="">전체 업종</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        <RefreshCcw className="h-4 w-4" />
        초기화
      </button>
    </section>
  );
}
