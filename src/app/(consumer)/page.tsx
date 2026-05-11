'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  DEFAULT_DISCOUNT_OPTION_ID,
  DEFAULT_SORT_OPTION_ID,
} from '@/lib/consumerProductFilters';
import {
  ALL_CATEGORY_ID,
  getConsumerProductCategories,
} from '@/hooks/products/useConsumerProducts';
import { Footer } from '@/components/common';
import { ConsumerHeader } from '@/components/consumer/ConsumerHeader';
import { ConsumerHeaderSearch } from '@/components/consumer/ConsumerHeaderSearch';
import { ConsumerProductList } from '@/components/consumer/ConsumerProductList';
import { ProductFilterSidebar } from '@/components/consumer/ProductFilterSidebar';
import { PromotionCarousel } from '@/components/consumer/PromotionCarousel';
import { mockProducts } from '@/mocks/products';

const regionItems = [
  { label: '서울 강남구 역삼동', value: '서울 강남구 역삼동' },
  { label: '서울 성동구 왕십리', value: '서울 성동구 왕십리' },
  { label: '서울 마포구 합정동', value: '서울 마포구 합정동' },
];

const PRODUCTS_PER_PAGE = 10;
const mockProductRegions: Record<string, string> = {
  store_1: '서울 마포구 합정동',
  store_2: '서울 성동구 왕십리',
  store_3: '서울 강남구 역삼동',
  store_4: '서울 강남구 역삼동',
  store_5: '서울 마포구 합정동',
  store_6: '서울 강남구 역삼동',
  store_7: '서울 성동구 왕십리',
  store_8: '서울 성동구 왕십리',
  store_9: '서울 마포구 합정동',
  store_10: '서울 강남구 역삼동',
};

export default function ConsumerPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID);
  const [selectedRegion, setSelectedRegion] = useState(regionItems[0].value);
  const [selectedSortOption, setSelectedSortOption] = useState(
    DEFAULT_SORT_OPTION_ID
  );
  const [selectedDiscountOption, setSelectedDiscountOption] = useState(
    DEFAULT_DISCOUNT_OPTION_ID
  );
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterNow, setFilterNow] = useState(() => Date.now());
  const productCategories = getConsumerProductCategories(mockProducts);

  useEffect(() => {
    const currentTime = Date.now();
    const nextEndAt = mockProducts
      .map((product) => new Date(product.endAt).getTime())
      .filter((endAt) => endAt > currentTime)
      .sort((a, b) => a - b)[0];

    if (!nextEndAt) {
      return;
    }

    const timerId = window.setTimeout(
      () => {
        setFilterNow(Date.now());
      },
      nextEndAt - currentTime + 1000
    );

    return () => {
      window.clearTimeout(timerId);
    };
  }, [filterNow]);

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
    setSelectedSortOption(sortOption);
    setCurrentPage(1);
  };

  const handleDiscountChange = (discountOption: string) => {
    setFilterNow(Date.now());
    setSelectedDiscountOption(discountOption);
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

            <ConsumerProductList
              products={mockProducts}
              selectedCategoryId={selectedCategoryId}
              selectedSortOption={selectedSortOption}
              selectedDiscountOption={selectedDiscountOption}
              selectedRegion={selectedRegion}
              productRegions={mockProductRegions}
              currentPage={currentPage}
              productsPerPage={PRODUCTS_PER_PAGE}
              now={filterNow}
              onPageChange={setCurrentPage}
            />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
