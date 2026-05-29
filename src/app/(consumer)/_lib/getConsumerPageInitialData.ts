import 'server-only';

import type { Category } from '@/types/category';
import type { PaginatedResult } from '@/types/common';
import type { Product } from '@/types/product';
import type { ProductListParams } from '@/contracts/product';
import { categoryServerApi } from '@/api/categories/categoryServerApi';
import { productServerApi } from '@/api/products/productServerApi';

interface ConsumerPageInitialData {
  initialCategories: Category[];
  initialProducts: PaginatedResult<Product>;
}

export async function getConsumerPageInitialData(
  productListParams: ProductListParams
): Promise<ConsumerPageInitialData> {
  const [initialProducts, initialCategories] = await Promise.all([
    productServerApi.getProducts(productListParams),
    categoryServerApi.getCategories(),
  ]);

  return {
    initialProducts,
    initialCategories,
  };
}
