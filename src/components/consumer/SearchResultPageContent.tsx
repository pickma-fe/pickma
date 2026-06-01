'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  CONSUMER_PRODUCTS_PER_PAGE,
  CONSUMER_REGION_ITEMS,
  getProductSortQuery,
} from '@/lib/consumerPageConfig';
import {
  ALL_CATEGORY_ID,
  DEFAULT_SORT_OPTION_ID,
  normalizeSortOptionId,
  type ProductSortOptionId,
} from '@/lib/consumerProductFilters';
import { useCategories } from '@/hooks/categories/useCategories';
import { useProducts } from '@/hooks/products/useProducts';
import { Dropdown, Footer } from '@/components/common';

import { ConsumerHeader } from './ConsumerHeader';
import { ConsumerHeaderSearch } from './ConsumerHeaderSearch';
import { ResultViewToggle, type ResultViewMode } from './ResultViewToggle';
import { SearchFilterSidebar } from './SearchFilterSidebar';
import { SearchResultContent } from './SearchResultContent';
import type { PriceRangeId } from './searchResultFilters';
import { getPriceRange, getPriceRangeId } from './searchResultFilters';

interface SearchResultPageContentProps {
  initialKeyword: string;
  initialRegion?: string;
  initialCategoryId?: string;
  initialPage: number;
  initialSortOption?: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
}

const sortOptions = [
  { id: 'deadline', label: '마감 임박순' },
  { id: 'discount-rate', label: '할인율 높은순' },
  { id: 'price-low', label: '가격 낮은순' },
] as const;

const categoryIconMap: Record<string, string> = {
  bread: '🥖',
  coffee: '☕',
  box: '🍱',
  salad: '🥗',
  food: '🍚',
};

export function SearchResultPageContent({
  initialKeyword,
  initialRegion,
  initialCategoryId,
  initialPage,
  initialSortOption,
  initialMinPrice,
  initialMaxPrice,
}: SearchResultPageContentProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [submittedKeyword, setSubmittedKeyword] = useState(initialKeyword);
  const [selectedRegion, setSelectedRegion] = useState(
    initialRegion || CONSUMER_REGION_ITEMS[0].value
  );
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
      { id: ALL_CATEGORY_ID, name: '전체', icon: '🔲' },
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
  const hasKeyword = submittedKeyword.length > 0;
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
      keyword: submittedKeyword || undefined,
      region: selectedRegion,
      categoryId:
        selectedCategoryId === ALL_CATEGORY_ID ? undefined : selectedCategoryId,
      minPrice: selectedPriceRange.minPrice,
      maxPrice: selectedPriceRange.maxPrice,
      sort: productSortQuery.sort,
      order: productSortQuery.order,
      availableOnly: true,
    },
    { enabled: hasKeyword }
  );
  const products = productList?.items ?? [];
  const totalCount = productList?.totalCount ?? 0;
  const totalPages = productList?.totalPages ?? 0;

  function updateSearchUrl(next: {
    keyword?: string;
    region?: string;
    page?: number;
    sortOption?: ProductSortOptionId;
    categoryId?: string;
    priceRangeId?: PriceRangeId;
  }): void {
    const nextKeyword = next.keyword ?? submittedKeyword;
    const nextRegion = next.region ?? selectedRegion;
    const nextPage = next.page ?? currentPage;
    const nextSortOption = next.sortOption ?? selectedSortOption;
    const nextCategoryId = next.categoryId ?? selectedCategoryId;
    const nextPriceRange = getPriceRange(
      next.priceRangeId ?? selectedPriceRangeId
    );
    const params = new URLSearchParams();

    if (nextKeyword.trim()) {
      params.set('q', nextKeyword.trim());
    }

    if (nextRegion) {
      params.set('region', nextRegion);
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

  function submitSearch(): void {
    const nextKeyword = keyword.trim();

    setSubmittedKeyword(nextKeyword);
    setCurrentPage(1);
    updateSearchUrl({ keyword: nextKeyword, page: 1 });
  }

  function handleRegionChange(region: string): void {
    setSelectedRegion(region);
    setCurrentPage(1);
    updateSearchUrl({ region, page: 1 });
  }

  function handleSortChange(sortOption: ProductSortOptionId): void {
    setSelectedSortOption(sortOption);
    setCurrentPage(1);
    updateSearchUrl({ sortOption, page: 1 });
  }

  function handlePriceRangeChange(priceRangeId: PriceRangeId): void {
    setSelectedPriceRangeId(priceRangeId);
    setCurrentPage(1);
    updateSearchUrl({ priceRangeId, page: 1 });
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
    <div className="flex min-h-screen flex-col bg-white">
      <ConsumerHeader
        slot={
          <ConsumerHeaderSearch
            regionItems={CONSUMER_REGION_ITEMS}
            selectedRegion={selectedRegion}
            keyword={keyword}
            onRegionChange={handleRegionChange}
            onKeywordChange={setKeyword}
            onSearch={submitSearch}
          />
        }
      />

      <main className="flex w-full flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <SearchFilterSidebar
          categories={productCategories}
          selectedCategoryId={selectedCategoryId}
          selectedPriceRangeId={selectedPriceRangeId}
          onCategoryChange={handleCategoryChange}
          onPriceRangeChange={handlePriceRangeChange}
          onResetFilters={handleResetFilters}
        />

        <section className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm text-gray-500">검색 결과</p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">
                {hasKeyword ? (
                  <>
                    “{submittedKeyword}” 검색 결과{' '}
                    <span className="text-primary-500">{totalCount}개</span>
                  </>
                ) : (
                  '검색어를 입력해 주세요'
                )}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Dropdown
                type="select"
                value={selectedSortOption}
                onChange={(value) =>
                  handleSortChange(normalizeSortOptionId(value))
                }
                items={sortOptions.map((option) => ({
                  label: option.label,
                  value: option.id,
                }))}
              />

              <ResultViewToggle
                viewMode={resultViewMode}
                onViewModeChange={setResultViewMode}
              />
            </div>
          </div>

          <SearchResultContent
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

      <Footer />
    </div>
  );
}
