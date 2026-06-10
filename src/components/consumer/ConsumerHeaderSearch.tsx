'use client';

import { SearchIcon } from 'lucide-react';
import type { FormEvent } from 'react';

import { Input } from '@/components/common';

type ConsumerHeaderSearchProps = {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
};

export function ConsumerHeaderSearch({
  keyword,
  onKeywordChange,
  onSearch,
}: ConsumerHeaderSearchProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form className="flex w-full min-w-0 items-center" onSubmit={handleSubmit}>
      <div className="min-w-0 flex-1">
        <Input
          aria-label="상품 검색"
          placeholder="상품명을 검색하세요"
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
