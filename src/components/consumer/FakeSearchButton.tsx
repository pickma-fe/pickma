'use client';

import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FakeSearchButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="상품 검색"
      onClick={() => router.push('/search')}
      className="focus-visible:ring-primary-500 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-400 hover:border-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:min-w-0 sm:flex-1 sm:justify-start sm:gap-2 sm:px-4 sm:text-sm"
    >
      <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="hidden truncate sm:inline">픽마에서 검색해보세요</span>
    </button>
  );
}
