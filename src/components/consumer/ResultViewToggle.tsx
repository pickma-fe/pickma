'use client';

import { Grid3X3Icon, ListIcon } from 'lucide-react';

export type ResultViewMode = 'grid' | 'list';

interface ResultViewToggleProps {
  viewMode: ResultViewMode;
  onViewModeChange: (viewMode: ResultViewMode) => void;
}

export function ResultViewToggle({
  viewMode,
  onViewModeChange,
}: ResultViewToggleProps) {
  return (
    <div className="hidden overflow-hidden rounded-md border border-gray-200 sm:flex">
      <button
        type="button"
        aria-label="그리드 보기"
        aria-pressed={viewMode === 'grid'}
        className={[
          'flex h-10 w-10 items-center justify-center transition',
          viewMode === 'grid'
            ? 'bg-primary-50 text-primary-500'
            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600',
        ].join(' ')}
        onClick={() => onViewModeChange('grid')}
      >
        <Grid3X3Icon className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="리스트 보기"
        aria-pressed={viewMode === 'list'}
        className={[
          'flex h-10 w-10 items-center justify-center transition',
          viewMode === 'list'
            ? 'bg-primary-50 text-primary-500'
            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600',
        ].join(' ')}
        onClick={() => onViewModeChange('list')}
      >
        <ListIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
