import 'server-only';

import type { Category } from '@/types/category';
import type { PaginatedResult } from '@/types/common';
import type { Product } from '@/types/product';
import type { ProductListParams } from '@/contracts/product';
import { mapCategory } from '@/api/categories/categoryMapper';
import { categoryServerApi } from '@/api/categories/categoryServerApi';
import { mapProduct } from '@/api/products/productMapper';
import { productServerApi } from '@/api/products/productServerApi';
import { mockCategories } from '@/mocks/categories';
import { buildMockProductListResponse } from '@/mocks/productList';

interface ConsumerPageInitialData {
  initialCategories: Category[];
  initialProducts: PaginatedResult<Product>;
}

export async function getConsumerPageInitialData(
  productListParams: ProductListParams
): Promise<ConsumerPageInitialData> {
  if (process.env.API_MOCK_ENABLED === 'true') {
    const productList = buildMockProductListResponse(productListParams);

    return {
      initialProducts: {
        ...productList,
        items: productList.items.map(mapProduct),
      },
      initialCategories: mockCategories.map(mapCategory),
    };
  }

  const [initialProducts, initialCategories] = await Promise.all([
    productServerApi.getProducts(productListParams),
    categoryServerApi.getCategories(),
  ]);

  return {
    initialProducts,
    initialCategories,
  };
}
