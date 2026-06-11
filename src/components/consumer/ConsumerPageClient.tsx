'use client';

import { useRouter } from 'next/navigation';
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
import { Button, Footer } from '@/components/common';

import { ConsumerHeader } from './ConsumerHeader';
import { ConsumerHeaderSearch } from './ConsumerHeaderSearch';
import { ConsumerProductList } from './ConsumerProductList';
import { LocationPickerButton } from './LocationPickerButton';
import { MapViewFab } from './MapViewFab';
import { NoLocationView } from './NoLocationView';
import { ProductFilterSidebar } from './ProductFilterSidebar';
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
  const router = useRouter();
  const { location, saveLocation } = useUserLocation();
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID);
  const [selectedSortOption, setSelectedSortOption] =
    useState<ProductSortOptionId>(DEFAULT_SORT_OPTION_ID);
  const [selectedDiscountOption, setSelectedDiscountOption] =
    useState<ProductDiscountOptionId>(DEFAULT_DISCOUNT_OPTION_ID);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productSortQuery = getProductSortQuery(selectedSortOption);
  const { data: categories = [] } = useCategories({
    initialData: initialCategories,
  });
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
    setSelectedSortOption(DEFAULT_SORT_OPTION_ID);
    setSelectedDiscountOption(DEFAULT_DISCOUNT_OPTION_ID);
    setCurrentPage(1);
  };

  const handleKeywordChange = (nextKeyword: string) => {
    setKeyword(nextKeyword);
  };

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      return;
    }

    router.push(`/search?keyword=${encodeURIComponent(trimmedKeyword)}`);
  };

  const handleRetryProducts = () => {
    void refetchProducts();
  };

  const productListContent = (() => {
    if (!location) {
      return <NoLocationView onLocationChange={saveLocation} />;
    }

    if (isProductsLoading) {
      return (
        <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
          상품을 불러오는 중입니다.
        </div>
      );
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
      />
    );
  })();

  return (
    <div className="bg-white">
      <ConsumerHeader
        slot={
          <div className="flex w-full max-w-160 min-w-0 items-center gap-2">
            <LocationPickerButton
              location={location}
              onLocationChange={saveLocation}
            />
            <ConsumerHeaderSearch
              keyword={keyword}
              onKeywordChange={handleKeywordChange}
              onSearch={handleSearch}
            />
          </div>
        }
      />

      <main className="min-h-screen bg-white">
        <div className="mx-auto grid max-w-450 grid-cols-1 lg:grid-cols-[220px_1fr]">
          <ProductFilterSidebar
            categories={productCategories}
            selectedCategoryId={selectedCategoryId}
            selectedSortOption={selectedSortOption}
            selectedDiscountOption={selectedDiscountOption}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onDiscountChange={handleDiscountChange}
            onResetFilters={handleResetFilters}
          />

          <section className="px-5 py-6 lg:px-6">
            <PromotionCarousel />

            {productListContent}
          </section>
        </div>
      </main>

      <MapViewFab />
      <Footer />
    </div>
  );
}
