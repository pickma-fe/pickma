'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import {
  ALL_CATEGORY_ID,
  CONSUMER_PRODUCT_CATEGORIES,
  DEFAULT_DISCOUNT_OPTION_ID,
  DEFAULT_SORT_OPTION_ID,
  normalizeDiscountOptionId,
  normalizeSortOptionId,
  type ProductDiscountOptionId,
  type ProductSortOptionId,
} from '@/lib/consumerProductFilters';
import { useProducts } from '@/hooks/products/useProducts';
import { Footer } from '@/components/common';
import { ConsumerHeader } from '@/components/consumer/ConsumerHeader';
import { ConsumerHeaderSearch } from '@/components/consumer/ConsumerHeaderSearch';
import { ConsumerProductList } from '@/components/consumer/ConsumerProductList';
import { ProductFilterSidebar } from '@/components/consumer/ProductFilterSidebar';
import { PromotionCarousel } from '@/components/consumer/PromotionCarousel';

const regionItems = [
  { label: '서울 강남구 역삼동', value: '서울 강남구' },
  { label: '서울 성동구 왕십리', value: '서울 성동구' },
  { label: '서울 마포구 합정동', value: '서울 마포구' },
];

const PRODUCTS_PER_PAGE = 10;
const PRODUCT_LIST_REFRESH_INTERVAL_MS = 60_000;

function getProductSortQuery(sortOption: ProductSortOptionId) {
  if (sortOption === 'discount-rate') {
    return { sort: 'discountRate' as const, order: 'desc' as const };
  }

  if (sortOption === 'price-low') {
    return { sort: 'discountPrice' as const, order: 'asc' as const };
  }

  return { sort: 'endAt' as const, order: 'asc' as const };
}

export default function ConsumerPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID);
  const [selectedRegion, setSelectedRegion] = useState(regionItems[0].value);
  const [selectedSortOption, setSelectedSortOption] =
    useState<ProductSortOptionId>(DEFAULT_SORT_OPTION_ID);
  const [selectedDiscountOption, setSelectedDiscountOption] =
    useState<ProductDiscountOptionId>(DEFAULT_DISCOUNT_OPTION_ID);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterNow, setFilterNow] = useState(() => Date.now());
  const productSortQuery = getProductSortQuery(selectedSortOption);
  const {
    data: productList,
    isError: isProductsError,
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = useProducts({
    page: currentPage,
    pageSize: PRODUCTS_PER_PAGE,
    region: selectedRegion,
    categoryId:
      selectedCategoryId === ALL_CATEGORY_ID ? undefined : selectedCategoryId,
    discountOption:
      selectedDiscountOption === DEFAULT_DISCOUNT_OPTION_ID
        ? undefined
        : selectedDiscountOption,
    sort: productSortQuery.sort,
    order: productSortQuery.order,
    availableOnly: true,
  });
  const products = useMemo(() => productList?.items ?? [], [productList]);

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
    const nextEndAt = products
      .map((product) => product.endAt.getTime())
      .filter((endAt) => endAt > currentTime)
      .sort((a, b) => a - b)[0];

    if (!nextEndAt) {
      return;
    }

    const timerId = window.setTimeout(
      () => {
        setFilterNow(Date.now());
        void refetchProducts();
      },
      nextEndAt - currentTime + 1000
    );

    return () => {
      window.clearTimeout(timerId);
    };
  }, [filterNow, products, refetchProducts]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFilterNow(Date.now());
      void refetchProducts();
    }, PRODUCT_LIST_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refetchProducts]);

  const handleCategoryChange = (categoryId: string) => {
    setFilterNow(Date.now());
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  const handleRegionChange = (region: string) => {
    setFilterNow(Date.now());
    setSelectedRegion(region);
    setCurrentPage(1);
  };

  const handleSortChange = (sortOption: string) => {
    setFilterNow(Date.now());
    setSelectedSortOption(normalizeSortOptionId(sortOption));
    setCurrentPage(1);
  };

  const handleDiscountChange = (discountOption: string) => {
    setFilterNow(Date.now());
    setSelectedDiscountOption(normalizeDiscountOptionId(discountOption));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterNow(Date.now());
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

    const searchParams = new URLSearchParams({
      keyword: trimmedKeyword,
      region: selectedRegion,
    });

    router.push(`/search?${searchParams.toString()}`);
  };

  const productListContent = (() => {
    if (isProductsLoading) {
      return (
        <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
          상품을 불러오는 중입니다.
        </div>
      );
    }

    if (isProductsError) {
      return (
        <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-red-200 bg-red-50 text-sm font-medium text-red-500">
          상품을 불러오지 못했습니다.
        </div>
      );
    }

    return (
      <ConsumerProductList
        products={products}
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
          <ConsumerHeaderSearch
            regionItems={regionItems}
            selectedRegion={selectedRegion}
            keyword={keyword}
            onRegionChange={handleRegionChange}
            onKeywordChange={handleKeywordChange}
            onSearch={handleSearch}
          />
        }
      />

      <main className="min-h-screen bg-white">
        <div className="mx-auto grid max-w-450 grid-cols-1 lg:grid-cols-[220px_1fr]">
          <ProductFilterSidebar
            categories={CONSUMER_PRODUCT_CATEGORIES}
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
      <Footer />
    </div>
  );
}
