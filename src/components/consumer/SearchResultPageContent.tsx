'use client';

import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useMemo, useState } from 'react';

import {
  CONSUMER_PRODUCTS_PER_PAGE,
  getProductSortQuery,
} from '@/lib/consumerPageConfig';
import {
  ALL_CATEGORY_ID,
  DEFAULT_SORT_OPTION_ID,
  normalizeSortOptionId,
  type ProductSortOptionId,
} from '@/lib/consumerProductFilters';
import { useCategories } from '@/hooks/categories/useCategories';
import { useUserLocation } from '@/hooks/consumer/useUserLocation';
import { useProducts } from '@/hooks/products/useProducts';
import { Input } from '@/components/common';

import { ResultViewToggle, type ResultViewMode } from './ResultViewToggle';
import { SearchFilterChips } from './SearchFilterChips';
import { SearchResultContent } from './SearchResultContent';
import type { PriceRangeId } from './searchResultFilters';
import { getPriceRange, getPriceRangeId } from './searchResultFilters';

interface SearchResultPageContentProps {
  initialKeyword: string;
  initialCategoryId?: string;
  initialPage: number;
  initialSortOption?: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
}

const categoryIconMap: Record<string, string> = {
  bread: '🥖',
  coffee: '☕',
  box: '🍱',
  salad: '🥗',
  food: '🍚',
};

export function SearchResultPageContent({
  initialKeyword,
  initialCategoryId,
  initialPage,
  initialSortOption,
  initialMinPrice,
  initialMaxPrice,
}: SearchResultPageContentProps) {
  const router = useRouter();
  const { location, saveLocation } = useUserLocation();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedSortOption, setSelectedSortOption] =
    useState<ProductSortOptionId>(
      normalizeSortOptionId(initialSortOption ?? DEFAULT_SORT_OPTION_ID)
    );
  const [selectedPriceRangeId, setSelectedPriceRangeId] =
    useState<PriceRangeId>(() =>
      getPriceRangeId(initialMinPrice, initialMaxPrice)
    );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialCategoryId || ALL_CATEGORY_ID
  );
  const [resultViewMode, setResultViewMode] = useState<ResultViewMode>('grid');
  const { data: categories = [] } = useCategories();
  const productCategories = useMemo(
    () => [
      { id: ALL_CATEGORY_ID, name: '전체' },
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon
          ? (categoryIconMap[category.icon] ?? category.icon)
          : undefined,
      })),
    ],
    [categories]
  );
  const productSortQuery = getProductSortQuery(selectedSortOption);
  const selectedPriceRange = getPriceRange(selectedPriceRangeId);
  const hasKeyword = initialKeyword.length > 0;
  const {
    data: productList,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useProducts(
    {
      page: currentPage,
      pageSize: CONSUMER_PRODUCTS_PER_PAGE,
      keyword: initialKeyword || undefined,
      categoryId:
        selectedCategoryId === ALL_CATEGORY_ID ? undefined : selectedCategoryId,
      minPrice: selectedPriceRange.minPrice,
      maxPrice: selectedPriceRange.maxPrice,
      sort: productSortQuery.sort,
      order: 'order' in productSortQuery ? productSortQuery.order : undefined,
      userLat: location?.lat,
      userLng: location?.lng,
      availableOnly: true,
    },
    { enabled: hasKeyword && Boolean(location) }
  );
  const products = productList?.items ?? [];
  const totalCount = productList?.totalCount ?? 0;
  const totalPages = productList?.totalPages ?? 0;

  const isFiltered =
    selectedCategoryId !== ALL_CATEGORY_ID ||
    selectedSortOption !== DEFAULT_SORT_OPTION_ID ||
    selectedPriceRangeId !== 'all';

  function handleSearch(): void {
    const q = keyword.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    handleSearch();
  }

  function updateSearchUrl(next: {
    page?: number;
    sortOption?: ProductSortOptionId;
    categoryId?: string;
    priceRangeId?: PriceRangeId;
  }): void {
    const nextPage = next.page ?? currentPage;
    const nextSortOption = next.sortOption ?? selectedSortOption;
    const nextCategoryId = next.categoryId ?? selectedCategoryId;
    const nextPriceRange = getPriceRange(
      next.priceRangeId ?? selectedPriceRangeId
    );
    const params = new URLSearchParams();

    if (initialKeyword.trim()) {
      params.set('q', initialKeyword.trim());
    }

    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }

    if (nextSortOption !== DEFAULT_SORT_OPTION_ID) {
      params.set('sort', nextSortOption);
    }

    if (nextCategoryId !== ALL_CATEGORY_ID) {
      params.set('categoryId', nextCategoryId);
    }

    if (nextPriceRange.minPrice !== undefined) {
      params.set('minPrice', String(nextPriceRange.minPrice));
    }

    if (nextPriceRange.maxPrice !== undefined) {
      params.set('maxPrice', String(nextPriceRange.maxPrice));
    }

    router.push(params.toString() ? `/search?${params.toString()}` : '/search');
  }

  function handleSortChange(sortOption: string): void {
    const normalized = normalizeSortOptionId(sortOption);
    setSelectedSortOption(normalized);
    setCurrentPage(1);
    updateSearchUrl({ sortOption: normalized, page: 1 });
  }

  function handlePriceRangeChange(priceRangeId: string): void {
    const id = priceRangeId as PriceRangeId;
    setSelectedPriceRangeId(id);
    setCurrentPage(1);
    updateSearchUrl({ priceRangeId: id, page: 1 });
  }

  function handleCategoryChange(categoryId: string): void {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
    updateSearchUrl({ categoryId, page: 1 });
  }

  function handlePageChange(page: number): void {
    setCurrentPage(page);
    updateSearchUrl({ page });
  }

  function handleResetFilters(): void {
    setSelectedCategoryId(ALL_CATEGORY_ID);
    setSelectedPriceRangeId('all');
    setSelectedSortOption(DEFAULT_SORT_OPTION_ID);
    setCurrentPage(1);
    updateSearchUrl({
      sortOption: DEFAULT_SORT_OPTION_ID,
      categoryId: ALL_CATEGORY_ID,
      priceRangeId: 'all',
      page: 1,
    });
  }

  return (
    <div className="flex-1 bg-white">
      <main className="mx-auto max-w-360 px-4 py-6 sm:px-6 lg:px-12">
        <form className="mb-4" onSubmit={handleSearchSubmit}>
          <Input
            aria-label="상품 검색"
            placeholder="상품명을 검색하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="h-10 w-full"
            endIcon={<SearchIcon className="h-4 w-4" />}
            endIconLabel="검색"
            onEndIconClick={handleSearch}
            autoFocus
          />
        </form>

        <SearchFilterChips
          categories={productCategories}
          selectedCategoryId={selectedCategoryId}
          selectedSortOption={selectedSortOption}
          selectedPriceRangeId={selectedPriceRangeId}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onPriceRangeChange={handlePriceRangeChange}
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
        />

        <section aria-label="검색 결과">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">
              {hasKeyword ? (
                <>
                  &ldquo;{initialKeyword}&rdquo;{' '}
                  <span className="text-base font-normal text-gray-500">
                    검색 결과 {isLoading ? 0 : totalCount}개
                  </span>
                </>
              ) : (
                <span className="text-base font-medium text-gray-500">
                  검색어를 입력해 주세요
                </span>
              )}
            </h1>
            <ResultViewToggle
              viewMode={resultViewMode}
              onViewModeChange={setResultViewMode}
            />
          </div>

          <SearchResultContent
            hasLocation={Boolean(location)}
            onLocationChange={saveLocation}
            hasKeyword={hasKeyword}
            isLoading={isLoading}
            isError={isError}
            isFetching={isFetching}
            products={products}
            totalPages={totalPages}
            currentPage={currentPage}
            viewMode={resultViewMode}
            onRetry={() => void refetch()}
            onPageChange={handlePageChange}
          />
        </section>
      </main>
    </div>
  );
}
