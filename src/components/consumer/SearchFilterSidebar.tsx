'use client';

import { Button } from '@/components/common';

import { SearchFilterRadio } from './SearchFilterRadio';
import type { PriceRangeId } from './searchResultFilters';
import { priceRangeOptions } from './searchResultFilters';

interface SearchFilterSidebarProps {
  categories: Array<{ id: string; name: string; icon?: string }>;
  selectedCategoryId: string;
  selectedPriceRangeId: PriceRangeId;
  onCategoryChange: (categoryId: string) => void;
  onPriceRangeChange: (priceRangeId: PriceRangeId) => void;
  onResetFilters: () => void;
}

export function SearchFilterSidebar({
  categories,
  selectedCategoryId,
  selectedPriceRangeId,
  onCategoryChange,
  onPriceRangeChange,
  onResetFilters,
}: SearchFilterSidebarProps) {
  return (
    <aside className="w-full shrink-0 border-gray-200 px-0 py-0 lg:w-55 lg:border-r lg:px-6 lg:py-8">
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

        <fieldset className="mt-6">
          <legend className="px-2 text-sm font-bold text-gray-900">
            가격대
          </legend>

          <div className="mt-4 space-y-3 px-2">
            {priceRangeOptions.map((option, index) => {
              const isSelected = selectedPriceRangeId === option.id;
              const inputId = `search-price-option-${index}`;

              return (
                <SearchFilterRadio
                  key={option.id}
                  id={inputId}
                  name="searchPriceRange"
                  label={option.label}
                  checked={isSelected}
                  onChange={() => onPriceRangeChange(option.id)}
                />
              );
            })}
          </div>
        </fieldset>
      </div>
    </aside>
  );
}
