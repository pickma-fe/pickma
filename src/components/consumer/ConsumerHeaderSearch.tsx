'use client';

import { SearchIcon } from 'lucide-react';
import type { FormEvent } from 'react';

import { Dropdown, Input } from '@/components/common';

type RegionItem = {
  label: string;
  value: string;
};

type ConsumerHeaderSearchProps = {
  regionItems: RegionItem[];
  selectedRegion: string;
  keyword: string;
  onRegionChange: (region: string) => void;
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
};

export function ConsumerHeaderSearch({
  regionItems,
  selectedRegion,
  keyword,
  onRegionChange,
  onKeywordChange,
  onSearch,
}: ConsumerHeaderSearchProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form
      className="flex w-full max-w-120 min-w-0 items-center gap-2 lg:max-w-160 xl:max-w-220 xl:gap-4"
      onSubmit={handleSubmit}
    >
      <div className="hidden shrink-0 xl:block">
        <Dropdown
          type="select"
          value={selectedRegion}
          onChange={onRegionChange}
          items={regionItems}
        />
      </div>

      <div className="min-w-0 flex-1">
        <Input
          aria-label="상품 또는 가게 검색"
          placeholder="상품명, 가게명으로 검색하세요"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          className="h-11 w-full"
          endIcon={<SearchIcon className="h-5 w-5" />}
          endIconLabel="검색"
          onEndIconClick={onSearch}
        />
      </div>
    </form>
  );
}
