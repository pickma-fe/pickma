'use client';

import { CheckIcon, Grid3X3Icon, ListIcon, StoreIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { Product } from '@/types/product';
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
import { formatPickupTime } from '@/lib/formatPickupTime';
import { useCategories } from '@/hooks/categories/useCategories';
import { useProducts } from '@/hooks/products/useProducts';
import { Button, Dropdown, Footer, Pagination } from '@/components/common';

import { ConsumerHeader } from './ConsumerHeader';
import { ConsumerHeaderSearch } from './ConsumerHeaderSearch';
import { ProductCard } from './ProductCard';

interface SearchResultPageContentProps {
  initialKeyword: string;
  initialRegion?: string;
  initialCategoryId?: string;
  initialPage: number;
  initialSortOption?: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
}

type PriceRangeId =
  | 'all'
  | 'under-10000'
  | '10000-20000'
  | '20000-30000'
  | 'over-30000';

type PriceRangeOption = {
  id: PriceRangeId;
  label: string;
  minPrice?: number;
  maxPrice?: number;
};

type ResultViewMode = 'grid' | 'list';

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

const FALLBACK_PRODUCT_IMAGE = '/images/products/noimage.png';

const priceRangeOptions: PriceRangeOption[] = [
  { id: 'all', label: '전체' },
  { id: 'under-10000', label: '1만원 미만', maxPrice: 10000 },
  {
    id: '10000-20000',
    label: '1만원 ~ 2만원',
    minPrice: 10000,
    maxPrice: 20000,
  },
  {
    id: '20000-30000',
    label: '2만원 ~ 3만원',
    minPrice: 20000,
    maxPrice: 30000,
  },
  { id: 'over-30000', label: '3만원 이상', minPrice: 30000 },
];

function getPriceRange(priceRangeId: PriceRangeId): PriceRangeOption {
  return (
    priceRangeOptions.find((option) => option.id === priceRangeId) ??
    priceRangeOptions[0]
  );
}

function getPriceRangeId(
  minPrice: number | undefined,
  maxPrice: number | undefined
): PriceRangeId {
  return (
    priceRangeOptions.find(
      (option) => option.minPrice === minPrice && option.maxPrice === maxPrice
    )?.id ?? 'all'
  );
}

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

interface ResultViewToggleProps {
  viewMode: ResultViewMode;
  onViewModeChange: (viewMode: ResultViewMode) => void;
}

function ResultViewToggle({
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

interface SearchFilterSidebarProps {
  categories: Array<{ id: string; name: string; icon?: string }>;
  selectedCategoryId: string;
  selectedPriceRangeId: PriceRangeId;
  onCategoryChange: (categoryId: string) => void;
  onPriceRangeChange: (priceRangeId: PriceRangeId) => void;
  onResetFilters: () => void;
}

function SearchFilterSidebar({
  categories,
  selectedCategoryId,
  selectedPriceRangeId,
  onCategoryChange,
  onPriceRangeChange,
  onResetFilters,
}: SearchFilterSidebarProps) {
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

        <fieldset className="mt-6">
          <legend className="px-2 text-sm font-bold text-gray-900">
            가격대
          </legend>

          <div className="mt-4 space-y-3 px-2">
            {priceRangeOptions.map((option, index) => {
              const isSelected = selectedPriceRangeId === option.id;
              const inputId = `search-price-option-${index}`;

              return (
                <FilterRadio
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

interface FilterRadioProps {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

function FilterRadio({ id, name, label, checked, onChange }: FilterRadioProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-500">
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />

      <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
        <span
          className={[
            'flex h-4 w-4 items-center justify-center rounded border',
            'peer-focus-visible:ring-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
            checked
              ? 'border-primary-500 bg-primary-500'
              : 'border-gray-300 bg-white',
          ].join(' ')}
          aria-hidden="true"
        >
          {checked && <CheckIcon className="h-3 w-3 text-white" />}
        </span>

        <span>{label}</span>
      </label>
    </div>
  );
}

interface SearchResultContentProps {
  hasKeyword: boolean;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  products: Product[];
  totalPages: number;
  currentPage: number;
  viewMode: ResultViewMode;
  onRetry: () => void;
  onPageChange: (page: number) => void;
}

function SearchResultContent({
  hasKeyword,
  isLoading,
  isError,
  isFetching,
  products,
  totalPages,
  currentPage,
  viewMode,
  onRetry,
  onPageChange,
}: SearchResultContentProps) {
  if (!hasKeyword) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
        <p className="text-sm font-medium text-gray-500">
          검색어를 입력하면 마감 할인 상품을 찾아드릴게요.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
        검색 결과를 불러오는 중입니다.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-red-200 bg-red-50 px-4 text-center">
        <p className="text-sm font-semibold text-red-500">
          검색 결과를 불러오지 못했습니다.
        </p>
        <Button
          type="button"
          variant="outline"
          color="primary"
          disabled={isFetching}
          onClick={onRetry}
        >
          {isFetching ? '다시 불러오는 중' : '다시 시도'}
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
        <p className="text-sm font-medium text-gray-500">
          검색 조건에 맞는 상품이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <SearchProductListItem key={product.id} product={product} />
          ))}
        </div>
      )}
      <div className="mt-8 flex justify-center">
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}

function SearchProductListItem({ product }: { product: Product }) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/products/${product.id}`}
        aria-label={`${product.name} 상품 상세 보기`}
        className="focus-visible:ring-primary-500 absolute inset-0 z-10 rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      />

      <div className="flex gap-4 p-4">
        <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-32 sm:w-44">
          <Image
            src={product.image || FALLBACK_PRODUCT_IMAGE}
            alt={product.name}
            fill
            sizes="176px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-base font-bold text-gray-900">
                {product.name}
              </h3>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                <StoreIcon
                  className="text-primary-500 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="line-clamp-1">{product.storeName}</span>
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <p className="text-sm text-gray-400 line-through">
                {product.originalPrice.toLocaleString()}원
              </p>
              <strong className="text-primary-500 text-xl font-bold">
                {product.discountPrice.toLocaleString()}원
              </strong>
              <p className="text-sm font-bold text-orange-500">
                {product.discountRate}% 할인
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-6">
            <span>
              픽업 {formatPickupTime(product.pickupStartTime)} ~{' '}
              {formatPickupTime(product.pickupEndTime)}
            </span>
            <span>남은 수량 {product.availableStock}개</span>
          </div>
        </div>
      </div>
    </article>
  );
}
