import 'server-only';

import type { Category } from '@/types/category';
import type { PaginatedResult } from '@/types/common';
import type { Product } from '@/types/product';
import type { ProductListParams } from '@/contracts/product';
import { createServerClient } from '@/lib/supabase/server';
import { mapCategory } from '@/api/categories/categoryMapper';
import { mapProduct } from '@/api/products/productMapper';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { getCategories } from '@/app/api/categories/_lib/service';
import {
  buildProductListResponse,
  getProducts,
} from '@/app/api/products/_lib/service';
import { mockCategories } from '@/mocks/categories';
import { mockProductDetailsMap, mockProductList } from '@/mocks/products';

interface ConsumerPageInitialData {
  initialCategories: Category[];
  initialProducts: PaginatedResult<Product>;
}

export async function getConsumerPageInitialData(
  productListParams: ProductListParams
): Promise<ConsumerPageInitialData> {
  if (isApiMockEnabled()) {
    const initialProductList = buildProductListResponse(
      mockProductList.items,
      productListParams,
      (product) => mockProductDetailsMap[product.id]?.store.region
    );

    return {
      initialProducts: {
        ...initialProductList,
        items: initialProductList.items.map(mapProduct),
      },
      initialCategories: mockCategories.map(mapCategory),
    };
  }

  const supabase = await createServerClient();
  const [initialProductList, initialCategoryList] = await Promise.all([
    getProducts(supabase, productListParams),
    getCategories(supabase),
  ]);

  return {
    initialProducts: {
      ...initialProductList,
      items: initialProductList.items.map(mapProduct),
    },
    initialCategories: initialCategoryList.map(mapCategory),
  };
}
