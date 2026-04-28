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
  const safeTotalPages = Math.max(0, totalPages);

  const safeCurrentPage = Math.max(
    1,
    Math.min(currentPage, Math.max(1, safeTotalPages))
  );

  const currentGroup = Math.ceil(safeCurrentPage / PAGE_GROUP_SIZE);
  const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
  const endPage = Math.min(currentGroup * PAGE_GROUP_SIZE, safeTotalPages);

  const pages =
    safeTotalPages === 0
      ? []
      : Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        );

  return (
    <nav aria-label="페이지네이션" className="flex items-center gap-1">
      <button
        type="button"
        aria-label="이전 페이지"
        onClick={() => onPageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1 || safeTotalPages === 0}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md border border-gray-200',
          safeCurrentPage === 1 || safeTotalPages === 0
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
          aria-current={safeCurrentPage === page ? 'page' : undefined}
          onClick={() => onPageChange(page)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md text-sm',
            safeCurrentPage === page
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
        onClick={() => onPageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage === safeTotalPages || safeTotalPages === 0}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md border border-gray-200',
          safeCurrentPage === safeTotalPages || safeTotalPages === 0
            ? 'cursor-default text-gray-300'
            : 'text-gray-500 hover:bg-gray-100'
        )}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
