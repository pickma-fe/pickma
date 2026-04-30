'use client';

import { LogInIcon, StoreIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  ALL_CATEGORY_ID,
  useConsumerProducts,
} from '@/hooks/products/useConsumerProducts';
import { Footer, Header, Pagination } from '@/components/common';
import { ConsumerHeaderSearch } from '@/components/consumer/ConsumerHeaderSearch';
import { ProductCard } from '@/components/consumer/ProductCard';
import {
  discountOptions,
  ProductFilterSidebar,
  sortOptions,
} from '@/components/consumer/ProductFilterSidebar';
import { PromotionCarousel } from '@/components/consumer/PromotionCarousel';
import { mockProducts } from '@/mocks/products';

const regionItems = [
  { label: '서울 강남구 역삼동', value: '서울 강남구 역삼동' },
  { label: '서울 성동구 왕십리', value: '서울 성동구 왕십리' },
  { label: '서울 마포구 합정동', value: '서울 마포구 합정동' },
];

const PRODUCTS_PER_PAGE = 10;

export default function ConsumerPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID);
  const [selectedRegion, setSelectedRegion] = useState(regionItems[0].value);
  const [selectedSortOption, setSelectedSortOption] = useState(sortOptions[0]);
  const [selectedDiscountOption, setSelectedDiscountOption] = useState(
    discountOptions[0]
  );
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (sortOption: string) => {
    setSelectedSortOption(sortOption);
    setCurrentPage(1);
  };

  const handleDiscountChange = (discountOption: string) => {
    setSelectedDiscountOption(discountOption);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedSortOption(sortOptions[0]);
    setSelectedDiscountOption(discountOptions[0]);
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

  const {
    productCategories,
    sortedProducts,
    paginatedProducts,
    totalPages,
    currentPage: safeCurrentPage,
  } = useConsumerProducts({
    products: mockProducts,
    selectedCategoryId,
    selectedSortOption,
    selectedDiscountOption,
    currentPage,
    productsPerPage: PRODUCTS_PER_PAGE,
  });

  return (
    <div className="bg-white">
      <Header
        user={null}
        logoHref="/"
        slot={
          <ConsumerHeaderSearch
            regionItems={regionItems}
            selectedRegion={selectedRegion}
            keyword={keyword}
            onRegionChange={setSelectedRegion}
            onKeywordChange={handleKeywordChange}
            onSearch={handleSearch}
          />
        }
        menuItems={[
          {
            label: '판매자센터',
            type: 'link',
            href: '/seller',
            icon: <StoreIcon className="h-5 w-5" aria-hidden="true" />,
            className: 'whitespace-nowrap',
          },
          {
            label: '로그인',
            type: 'link',
            href: '/login',
            icon: <LogInIcon className="h-5 w-5" aria-hidden="true" />,
            className: 'whitespace-nowrap',
          },
        ]}
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

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                전체 상품 {sortedProducts.length}개
              </p>
            </div>

            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
                조건에 맞는 상품이 없습니다.
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Pagination
                totalPages={totalPages}
                currentPage={safeCurrentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
