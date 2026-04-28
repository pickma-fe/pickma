'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PAGE_GROUP_SIZE = 5;

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
  const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
  const endPage = Math.min(currentGroup * PAGE_GROUP_SIZE, totalPages);

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <nav aria-label="페이지네이션" className="flex items-center gap-1">
      <button
        type="button"
        aria-label="이전 페이지"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md border border-gray-200',
          currentPage === 1
            ? 'cursor-default text-gray-300'
            : 'text-gray-500 hover:bg-gray-100'
        )}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          aria-label={`${page}페이지`}
          aria-current={currentPage === page ? 'page' : undefined}
          onClick={() => onPageChange(page)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md text-sm',
            currentPage === page
              ? 'border-primary-500 text-primary-500 border font-semibold'
              : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        aria-label="다음 페이지"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md border border-gray-200',
          currentPage === totalPages
            ? 'cursor-default text-gray-300'
            : 'text-gray-500 hover:bg-gray-100'
        )}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
