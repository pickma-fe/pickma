'use client';

import { Search } from 'lucide-react';

import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { Input } from '@/components/common/Input/Input';

interface MenuFilterProps {
  categories: string[];
  selectedCategory: string;
  searchKeyword: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (keyword: string) => void;
}

export function MenuFilter({
  categories,
  selectedCategory,
  searchKeyword,
  onCategoryChange,
  onSearchChange,
}: MenuFilterProps) {
  const categoryOptions = categories.map((category) => ({
    label: category,
    value: category,
  }));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Dropdown
        type="select"
        items={categoryOptions}
        value={selectedCategory}
        onChange={onCategoryChange}
        placeholder="전체 카테고리"
      />
      <div className="w-full sm:w-64">
        <Input
          aria-label="메뉴명 검색"
          placeholder="메뉴명 검색"
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          startIcon={<Search className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}
