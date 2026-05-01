'use client';

import type { ProductFilterCategory } from '@/types/consumer';
import type { ProductListItemResponse } from '@/contracts/product';
import { isProductAvailable } from '@/lib/product';

export const ALL_CATEGORY_ID = 'category-all';

const categoryIconMap: Record<string, string> = {
  category_bakery: '🥖',
  category_salad: '🥗',
  category_lunchbox: '🍱',
  category_cafe: '☕',
  category_snack: '🍚',
};

type UseConsumerProductsParams = {
  products: ProductListItemResponse[];
  selectedCategoryId: string;
  selectedSortOption: string;
  selectedDiscountOption: string;
  currentPage: number;
  productsPerPage: number;
  now: number;
};

export function useConsumerProducts({
  products,
  selectedCategoryId,
  selectedSortOption,
  selectedDiscountOption,
  currentPage,
  productsPerPage,
  now,
}: UseConsumerProductsParams) {
  const productCategories = getProductCategories(products);

  const availableProducts = products.filter((product) =>
    isProductAvailable({ product, now })
  );

  const categoryFilteredProducts =
    selectedCategoryId === ALL_CATEGORY_ID
      ? availableProducts
      : availableProducts.filter(
          (product) => product.categoryId === selectedCategoryId
        );

  const filteredProducts = categoryFilteredProducts.filter((product) =>
    matchesDiscountOption(product, selectedDiscountOption)
  );

  const sortedProducts = [...filteredProducts].sort((a, b) =>
    compareProducts(a, b, selectedSortOption)
  );

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedProducts = sortedProducts.slice(
    (safeCurrentPage - 1) * productsPerPage,
    safeCurrentPage * productsPerPage
  );

  return {
    productCategories,
    sortedProducts,
    paginatedProducts,
    totalPages,
    currentPage: safeCurrentPage,
  };
}

function getProductCategories(
  products: ProductListItemResponse[]
): ProductFilterCategory[] {
  return [
    { id: ALL_CATEGORY_ID, name: '전체', icon: '🔲' },
    ...Array.from(
      new Map(
        products.flatMap((product) => {
          if (!product.categoryId || !product.categoryName) {
            return [];
          }

          return [
            [
              product.categoryId,
              {
                id: product.categoryId,
                name: product.categoryName,
                icon: categoryIconMap[product.categoryId] ?? '🍽️',
              },
            ] as const,
          ];
        })
      ).values()
    ),
  ];
}

function matchesDiscountOption(
  product: ProductListItemResponse,
  discountOption: string
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
  a: ProductListItemResponse,
  b: ProductListItemResponse,
  sortOption: string
) {
  if (sortOption === 'deadline') {
    return new Date(a.endAt).getTime() - new Date(b.endAt).getTime();
  }

  if (sortOption === 'discount-rate') {
    return b.discountRate - a.discountRate;
  }

  if (sortOption === 'price-low') {
    return a.discountPrice - b.discountPrice;
  }

  return 0;
}
