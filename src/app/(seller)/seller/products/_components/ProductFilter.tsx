'use client';

import { Search } from 'lucide-react';

import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { Input } from '@/components/common/Input/Input';

interface ProductFilterProps {
  selectedStatus: string;
  selectedCategory: string;
  searchKeyword: string;
  sortBy: string;
  detailFilter: string;
  categories: string[];
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
  onSearchChange: (keyword: string) => void;
  onSortChange: (sort: string) => void;
  onDetailFilterChange: (filter: string) => void;
}

const STATUS_OPTIONS = [
  { label: '전체 상태', value: '전체' },
  { label: '판매중', value: '판매중' },
  { label: '품절', value: '품절' },
  { label: '판매중지', value: '판매중지' },
];

const SORT_OPTIONS = [
  { label: '등록일 최신순', value: 'latest' },
  { label: '등록일 오래된순', value: 'oldest' },
  { label: '가격 높은순', value: 'price-high' },
  { label: '가격 낮은순', value: 'price-low' },
  { label: '이름순', value: 'name' },
];

const DETAIL_FILTER_OPTIONS = [
  { label: '상세 필터', value: '전체' },
  { label: '재고 있음', value: 'in-stock' },
  { label: '재고 부족 (5개 이하)', value: 'low-stock' },
  { label: '오늘 마감', value: 'today-end' },
  { label: '할인율 30% 이상', value: 'high-discount' },
];

export function ProductFilter({
  selectedStatus,
  selectedCategory,
  searchKeyword,
  sortBy,
  detailFilter,
  categories,
  onStatusChange,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onDetailFilterChange,
}: ProductFilterProps) {
  const categoryOptions = [
    { label: '전체 카테고리', value: '전체' },
    ...categories.map((cat) => ({ label: cat, value: cat })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Dropdown
          type="select"
          items={STATUS_OPTIONS}
          value={selectedStatus}
          onChange={onStatusChange}
          placeholder="전체 상태"
        />
        <Dropdown
          type="select"
          items={categoryOptions}
          value={selectedCategory}
          onChange={onCategoryChange}
          placeholder="전체 카테고리"
        />

        <div className="min-w-[200px] flex-1">
          <Input
            placeholder="상품명을 검색하세요"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            startIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <Dropdown
          type="select"
          items={DETAIL_FILTER_OPTIONS}
          value={detailFilter}
          onChange={onDetailFilterChange}
          placeholder="상세 필터"
        />

        <Dropdown
          type="select"
          items={SORT_OPTIONS}
          value={sortBy}
          onChange={onSortChange}
          placeholder="등록일 최신순"
        />
      </div>
    </div>
  );
}
