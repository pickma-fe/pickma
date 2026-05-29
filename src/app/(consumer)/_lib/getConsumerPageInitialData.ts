import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Category } from '@/types/category';
import type { PaginatedResult } from '@/types/common';
import type { Product } from '@/types/product';
import type { ProductListParams } from '@/contracts/product';
import type { Database } from '@/lib/supabase/database';
import { createServerClient } from '@/lib/supabase/server';
import { mapCategory } from '@/api/categories/categoryMapper';
import { mapProduct } from '@/api/products/productMapper';
import { productServerApi } from '@/api/products/productServerApi';
import { mockCategories } from '@/mocks/categories';
import { buildMockProductListResponse } from '@/mocks/productList';

interface ConsumerPageInitialData {
  initialCategories: Category[];
  initialProducts: PaginatedResult<Product>;
}

type CategoryRow = {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
};

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

  const supabase = await createServerClient();
  const [initialProducts, initialCategories] = await Promise.all([
    productServerApi.getProducts(productListParams),
    getInitialCategories(supabase),
  ]);

  return {
    initialProducts,
    initialCategories,
  };
}

async function getInitialCategories(
  supabase: SupabaseClient<Database>
): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, icon, sort_order')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as CategoryRow[]).map((row) =>
    mapCategory({
      id: row.id,
      name: row.name,
      ...(row.icon !== null && { icon: row.icon }),
      sortOrder: row.sort_order,
    })
  );
}
