'use client';

import { CheckIcon, ChevronRightIcon } from 'lucide-react';

import type { ProductFilterCategory } from '@/hooks/products/consumerProductFilters';
import { Button } from '@/components/common';

export const discountOptions = [
  { id: 'all', label: '전체' },
  { id: 'over-40', label: '40% 이상' },
  { id: '30-to-40', label: '30% ~ 40%' },
  { id: '20-to-30', label: '20% ~ 30%' },
  { id: 'under-20', label: '20% 미만' },
];

export const sortOptions = [
  { id: 'deadline', label: '마감 임박순' },
  { id: 'discount-rate', label: '할인율 높은순' },
  { id: 'price-low', label: '가격 낮은순' },
];

interface ProductFilterSidebarProps {
  categories: ProductFilterCategory[];
  selectedCategoryId: string;
  selectedSortOption: string;
  selectedDiscountOption: string;
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (sortOption: string) => void;
  onDiscountChange: (discountOption: string) => void;
  onResetFilters: () => void;
}

export function ProductFilterSidebar({
  categories,
  selectedCategoryId,
  selectedSortOption,
  selectedDiscountOption,
  onCategoryChange,
  onSortChange,
  onDiscountChange,
  onResetFilters,
}: ProductFilterSidebarProps) {
  return (
    <aside className="hidden w-55 shrink-0 border-r border-gray-200 px-6 py-8 lg:block">
      <nav className="space-y-2">
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;

          return (
            <Button
              key={category.id}
              variant="ghost"
              color="gray"
              aria-pressed={isSelected}
              className={[
                'w-full rounded-lg px-4 py-3 text-sm font-bold',
                isSelected
                  ? 'border-primary-200 bg-primary-50 text-primary-500'
                  : 'border-transparent',
              ].join(' ')}
              onClick={() => onCategoryChange(category.id)}
            >
              <span className="flex w-full items-center gap-3">
                {category.icon && (
                  <span aria-hidden="true">{category.icon}</span>
                )}
                <span>{category.name}</span>
              </span>
            </Button>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="px-2 text-sm font-bold text-gray-900">필터</h2>

          <Button
            variant="ghost"
            color="gray"
            className="px-2 py-1 text-xs font-normal hover:bg-transparent hover:text-gray-500"
            onClick={onResetFilters}
          >
            초기화
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {sortOptions.map((option) => {
            const isSelected = selectedSortOption === option.id;

            return (
              <Button
                key={option.id}
                variant={'ghost'}
                color={'gray'}
                aria-pressed={isSelected}
                className={[
                  'w-full rounded-lg px-4 py-3 text-sm font-bold',
                  isSelected
                    ? 'border-primary-200 bg-primary-50 text-primary-500'
                    : 'border-transparent',
                ].join(' ')}
                onClick={() => onSortChange(option.id)}
              >
                <span className="flex w-full items-center justify-between">
                  <span>{option.label}</span>
                  <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                </span>
              </Button>
            );
          })}
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="px-2 text-sm font-bold text-gray-900">할인율</h2>

          <div className="mt-4 space-y-3 px-2">
            {discountOptions.map((option, index) => {
              const isSelected = selectedDiscountOption === option.id;
              const inputId = `discount-option-${index}`;

              return (
                <div
                  key={option.id}
                  className="flex items-center gap-3 text-sm text-gray-500"
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="discountRate"
                    checked={isSelected}
                    onChange={() => onDiscountChange(option.id)}
                    className="sr-only"
                  />

                  <label
                    htmlFor={inputId}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <span
                      className={[
                        'flex h-4 w-4 items-center justify-center rounded border',
                        isSelected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300 bg-white',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                    </span>

                    <span>{option.label}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
