'use client';

import { SearchIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { useUserLocation } from '@/hooks/consumer/useUserLocation';
import { Input } from '@/components/common';

import { LocationPickerButton } from './LocationPickerButton';

export function SearchHeaderSlot() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { location, saveLocation } = useUserLocation();
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');

  function handleSearch() {
    const q = keyword.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSearch();
  }

  return (
    <div className="flex w-full items-center gap-2">
      <LocationPickerButton
        location={location}
        onLocationChange={saveLocation}
      />
      <form className="min-w-0 flex-1" onSubmit={handleSubmit}>
        <Input
          aria-label="상품 검색"
          placeholder="상품명을 검색하세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="h-10 w-full"
          endIcon={<SearchIcon className="h-4 w-4" />}
          endIconLabel="검색"
          onEndIconClick={handleSearch}
        />
      </form>
    </div>
  );
}
