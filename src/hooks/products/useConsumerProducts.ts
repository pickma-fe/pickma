'use client';

import {
  ALL_CATEGORY_ID,
  normalizeDiscountOptionId,
  normalizeSortOptionId,
  type ProductDiscountOptionId,
  type ProductSortOptionId,
} from '@/lib/consumerProductFilters';
import { isProductAvailable } from '@/lib/product';
import type { Product } from '@/types';

type UseConsumerProductsParams = {
  products: Product[];
  selectedCategoryId: string;
  selectedSortOption: string;
  selectedDiscountOption: string;
  currentPage: number;
  productsPerPage: number;
  now: number;
  selectedRegion?: string;
  productRegions?: Record<string, string>;
};

export function useConsumerProducts({
  products,
  selectedCategoryId,
  selectedSortOption,
  selectedDiscountOption,
  currentPage,
  productsPerPage,
  now,
  selectedRegion,
  productRegions,
}: UseConsumerProductsParams) {
  const normalizedSortOption = normalizeSortOptionId(selectedSortOption);
  const normalizedDiscountOption = normalizeDiscountOptionId(
    selectedDiscountOption
  );

  const availableProducts = products.filter((product) =>
    isProductAvailable({ product, now })
  );

  const regionFilteredProducts =
    selectedRegion && productRegions
      ? availableProducts.filter(
          (product) => productRegions[product.storeId] === selectedRegion
        )
      : availableProducts;

  const categoryFilteredProducts =
    selectedCategoryId === ALL_CATEGORY_ID
      ? regionFilteredProducts
      : regionFilteredProducts.filter(
          (product) => product.categoryId === selectedCategoryId
        );

  const filteredProducts = categoryFilteredProducts.filter((product) =>
    matchesDiscountOption(product, normalizedDiscountOption)
  );

  const sortedProducts = [...filteredProducts].sort((a, b) =>
    compareProducts(a, b, normalizedSortOption)
  );

  const safeProductsPerPage = Math.max(1, productsPerPage);
  const totalPages = Math.ceil(sortedProducts.length / safeProductsPerPage);

  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedProducts = sortedProducts.slice(
    (safeCurrentPage - 1) * safeProductsPerPage,
    safeCurrentPage * safeProductsPerPage
  );

  return {
    sortedProducts,
    paginatedProducts,
    totalPages,
    currentPage: safeCurrentPage,
  };
}

function matchesDiscountOption(
  product: Product,
  discountOption: ProductDiscountOptionId
) {
  if (discountOption === 'all') {
    return true;
  }

  if (discountOption === 'over-40') {
    return product.discountRate >= 40;
  }

  if (discountOption === '30-to-40') {
    return product.discountRate >= 30 && product.discountRate < 40;
  }

  if (discountOption === '20-to-30') {
    return product.discountRate >= 20 && product.discountRate < 30;
  }

  if (discountOption === 'under-20') {
    return product.discountRate < 20;
  }

  return true;
}

function compareProducts(
  a: Product,
  b: Product,
  sortOption: ProductSortOptionId
) {
  if (sortOption === 'deadline') {
    return a.endAt.getTime() - b.endAt.getTime();
  }

  if (sortOption === 'discount-rate') {
    return b.discountRate - a.discountRate;
  }

  if (sortOption === 'price-low') {
    return a.discountPrice - b.discountPrice;
  }

  return 0;
}
