'use client';

import { Search } from 'lucide-react';

import { Input } from '@/components/common/Input/Input';

interface OrderFilterProps {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
}

export function OrderFilter({
  searchKeyword,
  onSearchChange,
}: OrderFilterProps) {
  return (
    <Input
      aria-label="주문번호 검색"
      placeholder="주문번호를 검색하세요"
      value={searchKeyword}
      onChange={(e) => onSearchChange(e.target.value)}
      startIcon={<Search className="h-4 w-4" />}
    />
  );
}
