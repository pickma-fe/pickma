'use client';

import { Search } from 'lucide-react';

import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { Input } from '@/components/common/Input/Input';

interface OrderFilterProps {
  selectedStatus: string;
  searchKeyword: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (keyword: string) => void;
}

const STATUS_OPTIONS = [
  { label: '전체', value: '전체' },
  { label: '수락 대기', value: 'reserved' },
  { label: '주문 승인', value: 'accepted' },
  { label: '픽업 대기', value: 'ready' },
  { label: '픽업 완료', value: 'completed' },
  { label: '취소/환불', value: 'cancelled' },
  { label: '미수령', value: 'no_show' },
];

export function OrderFilter({
  selectedStatus,
  searchKeyword,
  onStatusChange,
  onSearchChange,
}: OrderFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dropdown
        type="select"
        items={STATUS_OPTIONS}
        value={selectedStatus}
        onChange={onStatusChange}
        placeholder="전체"
      />
      <div className="min-w-[200px] flex-1">
        <Input
          placeholder="주문번호를 검색하세요"
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          startIcon={<Search className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}
