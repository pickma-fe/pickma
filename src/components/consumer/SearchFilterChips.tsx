'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon, XIcon } from 'lucide-react';

import {
  DEFAULT_SORT_OPTION_ID,
  SORT_OPTIONS,
  type ProductFilterCategory,
  type ProductSortOptionId,
} from '@/lib/consumerProductFilters';

import type { PriceRangeId } from './searchResultFilters';
import { priceRangeOptions } from './searchResultFilters';

interface SearchFilterChipsProps {
  categories: ProductFilterCategory[];
  selectedCategoryId: string;
  selectedSortOption: ProductSortOptionId;
  selectedPriceRangeId: PriceRangeId;
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (sortOption: string) => void;
  onPriceRangeChange: (priceRangeId: string) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export function SearchFilterChips({
  categories,
  selectedCategoryId,
  selectedSortOption,
  selectedPriceRangeId,
  onCategoryChange,
  onSortChange,
  onPriceRangeChange,
  onResetFilters,
  isFiltered,
}: SearchFilterChipsProps) {
  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.id === selectedSortOption)?.label ?? '정렬';
  const currentPriceLabel =
    priceRangeOptions.find((o) => o.id === selectedPriceRangeId)?.label ??
    '가격대';

  return (
    <div className="mb-6 space-y-2">
      {/* 카테고리 가로 스크롤 */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto py-0.5">
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onCategoryChange(category.id)}
              className={[
                'focus-visible:ring-primary-500 flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
              ].join(' ')}
            >
              {category.icon && <span aria-hidden="true">{category.icon}</span>}
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* 정렬 + 가격대 + 초기화 */}
      <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
        <FilterDropdown
          label={currentSortLabel}
          isActive={selectedSortOption !== DEFAULT_SORT_OPTION_ID}
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem
              key={option.id}
              as="button"
              type="button"
              onClick={() => onSortChange(option.id)}
              className={[
                'block w-full rounded px-3 py-2 text-left text-sm',
                selectedSortOption === option.id
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-700 data-focus:bg-gray-100',
              ].join(' ')}
            >
              {option.label}
            </MenuItem>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label={selectedPriceRangeId !== 'all' ? currentPriceLabel : '가격대'}
          isActive={selectedPriceRangeId !== 'all'}
        >
          {priceRangeOptions.map((option) => (
            <MenuItem
              key={option.id}
              as="button"
              type="button"
              onClick={() => onPriceRangeChange(option.id)}
              className={[
                'block w-full rounded px-3 py-2 text-left text-sm',
                selectedPriceRangeId === option.id
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-700 data-focus:bg-gray-100',
              ].join(' ')}
            >
              {option.label}
            </MenuItem>
          ))}
        </FilterDropdown>

        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            aria-label="필터 초기화"
            className="focus-visible:ring-primary-500 flex shrink-0 items-center gap-1 rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
            초기화
          </button>
        )}
      </div>
    </div>
  );
}

function FilterDropdown({
  label,
  isActive,
  children,
}: {
  label: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Menu as="div" className="relative shrink-0">
      <MenuButton
        className={[
          'focus-visible:ring-primary-500 flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          isActive
            ? 'border-primary-500 bg-primary-50 text-primary-600'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
        ].join(' ')}
      >
        {label}
        <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </MenuButton>
      <MenuItems
        anchor="bottom start"
        className="z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-md focus:outline-none"
      >
        {children}
      </MenuItems>
    </Menu>
  );
}
