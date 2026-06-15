'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Category } from '@/types/category';
import {
  CONSUMER_PRODUCTS_PER_PAGE,
  getProductSortQuery,
} from '@/lib/consumerPageConfig';
import {
  ALL_CATEGORY_ID,
  DEFAULT_DISCOUNT_OPTION_ID,
  DEFAULT_SORT_OPTION_ID,
  normalizeDiscountOptionId,
  normalizeSortOptionId,
  type ProductDiscountOptionId,
  type ProductSortOptionId,
} from '@/lib/consumerProductFilters';
import { useCategories } from '@/hooks/categories/useCategories';
import { useUserLocation } from '@/hooks/consumer/useUserLocation';
import { useProducts } from '@/hooks/products/useProducts';
import { Button } from '@/components/common';

import { ConsumerProductList } from './ConsumerProductList';
import { MapViewFab } from './MapViewFab';
import { NoLocationView } from './NoLocationView';
import { ProductFilterChips } from './ProductFilterChips';
import { PromotionCarousel } from './PromotionCarousel';

interface ConsumerPageClientProps {
  initialCategories?: Category[];
}

const PRODUCT_LIST_REFRESH_INTERVAL_MS = 60_000;
const categoryIconMap: Record<string, string> = {
  bread: '🥖',
  coffee: '☕',
  box: '🍱',
  salad: '🥗',
  food: '🍚',
};

export function ConsumerPageClient({
  initialCategories,
}: ConsumerPageClientProps) {
  const { location, saveLocation } = useUserLocation();
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID);
  const [selectedSortOption, setSelectedSortOption] =
    useState<ProductSortOptionId>(DEFAULT_SORT_OPTION_ID);
  const [selectedDiscountOption, setSelectedDiscountOption] =
    useState<ProductDiscountOptionId>(DEFAULT_DISCOUNT_OPTION_ID);
  const [currentPage, setCurrentPage] = useState(1);
  const productSortQuery = getProductSortQuery(selectedSortOption);
  const { data: categories = [] } = useCategories({
    initialData: initialCategories,
  });
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
  const {
    data: productList,
    isError: isProductsError,
    isFetching: isProductsFetching,
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = useProducts(
    {
      page: currentPage,
      pageSize: CONSUMER_PRODUCTS_PER_PAGE,
      categoryId:
        selectedCategoryId === ALL_CATEGORY_ID ? undefined : selectedCategoryId,
      discountOption:
        selectedDiscountOption === DEFAULT_DISCOUNT_OPTION_ID
          ? undefined
          : selectedDiscountOption,
      sort: productSortQuery.sort,
      order: 'order' in productSortQuery ? productSortQuery.order : undefined,
      userLat: location?.lat,
      userLng: location?.lng,
      availableOnly: true,
    },
    { enabled: !!location }
  );
  const products = productList?.items;

  useEffect(() => {
    if (!productList) {
      return;
    }

    const safeCurrentPage =
      productList.totalPages === 0
        ? 1
        : Math.min(Math.max(productList.page, 1), productList.totalPages);

    if (currentPage === safeCurrentPage) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setCurrentPage(safeCurrentPage);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [currentPage, productList]);

  useEffect(() => {
    const currentTime = Date.now();
    const nextEndAt = (products ?? [])
      .map((product) => product.endAt.getTime())
      .filter((endAt) => endAt > currentTime)
      .sort((a, b) => a - b)[0];

    if (!nextEndAt) {
      return;
    }

    const timerId = window.setTimeout(
      () => {
        void refetchProducts();
      },
      Math.max(0, nextEndAt - currentTime)
    );

    return () => {
      window.clearTimeout(timerId);
    };
  }, [products, refetchProducts]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refetchProducts();
    }, PRODUCT_LIST_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refetchProducts]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (sortOption: string) => {
    setSelectedSortOption(normalizeSortOptionId(sortOption));
    setCurrentPage(1);
  };

  const handleDiscountChange = (discountOption: string) => {
    setSelectedDiscountOption(normalizeDiscountOptionId(discountOption));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategoryId(ALL_CATEGORY_ID);
    setSelectedSortOption(DEFAULT_SORT_OPTION_ID);
    setSelectedDiscountOption(DEFAULT_DISCOUNT_OPTION_ID);
    setCurrentPage(1);
  };

  const handleRetryProducts = () => {
    void refetchProducts();
  };

  const isFiltered =
    selectedCategoryId !== ALL_CATEGORY_ID ||
    selectedSortOption !== DEFAULT_SORT_OPTION_ID ||
    selectedDiscountOption !== DEFAULT_DISCOUNT_OPTION_ID;

  const productListContent = (() => {
    if (!location) {
      return <NoLocationView onLocationChange={saveLocation} />;
    }

    if (isProductsError) {
      return (
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-red-200 bg-red-50 px-4 text-center">
          <div>
            <p className="text-sm font-semibold text-red-500">
              상품을 불러오지 못했습니다.
            </p>
            <p className="mt-2 text-xs text-red-400">
              일시적인 오류일 수 있으니 다시 시도해 주세요.
            </p>
          </div>
          <Button
            type="button"
            color="danger"
            disabled={isProductsFetching}
            onClick={handleRetryProducts}
          >
            {isProductsFetching ? '다시 불러오는 중' : '다시 시도'}
          </Button>
        </div>
      );
    }

    return (
      <ConsumerProductList
        products={products ?? []}
        totalCount={productList?.totalCount ?? 0}
        totalPages={productList?.totalPages ?? 0}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
        isLoading={isProductsLoading}
      />
    );
  })();

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-360 px-4 py-6 sm:px-6 lg:px-12">
          <PromotionCarousel />

          <ProductFilterChips
            categories={productCategories}
            selectedCategoryId={selectedCategoryId}
            selectedSortOption={selectedSortOption}
            selectedDiscountOption={selectedDiscountOption}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onDiscountChange={handleDiscountChange}
            onResetFilters={handleResetFilters}
            isFiltered={isFiltered}
          />

          <section aria-label="상품 목록">{productListContent}</section>
        </div>
      </main>

      <MapViewFab />
    </>
  );
}
