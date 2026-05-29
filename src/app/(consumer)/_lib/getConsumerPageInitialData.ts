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
import { mockCategories } from '@/mocks/categories';
import { mockProductDetailsMap, mockProductList } from '@/mocks/products';

interface ConsumerPageInitialData {
  initialCategories: Category[];
  initialProducts: PaginatedResult<Product>;
}

type ProductRow = {
  id: string;
  store_id: string;
  menu_item_id: string;
  category_id: string | null;
  discount_price: number;
  original_price: number;
  discount_rate: number;
  available_stock: number;
  stock: number;
  reserved_stock: number;
  end_at: string;
  pickup_start_time: string;
  pickup_end_time: string;
  status: 'active' | 'closed';
  updated_at: string;
  menu_items: {
    id: string;
    name: string;
    image: string | null;
  };
  categories: {
    id: string;
    name: string;
  } | null;
  stores: {
    name: string;
    region: string;
  };
};

type CategoryRow = {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
};

const PRODUCT_SELECT = [
  'id',
  'store_id',
  'menu_item_id',
  'category_id',
  'discount_price',
  'original_price',
  'discount_rate',
  'available_stock',
  'stock',
  'reserved_stock',
  'end_at',
  'pickup_start_time',
  'pickup_end_time',
  'status',
  'updated_at',
  'menu_items!inner(id, name, image)',
  'categories(id, name)',
  'stores!inner(name, region)',
].join(', ');

export async function getConsumerPageInitialData(
  productListParams: ProductListParams
): Promise<ConsumerPageInitialData> {
  if (process.env.API_MOCK_ENABLED === 'true') {
    return {
      initialProducts: buildMockProductList(productListParams),
      initialCategories: mockCategories.map(mapCategory),
    };
  }

  // Fetch directly on the server to avoid localhost self-fetch during SSR while
  // keeping page code independent from Route Handler-only app/api/*/_lib files.
  const supabase = await createServerClient();
  const [initialProducts, initialCategories] = await Promise.all([
    getInitialProducts(supabase, productListParams),
    getInitialCategories(supabase),
  ]);

  return {
    initialProducts,
    initialCategories,
  };
}

async function getInitialProducts(
  supabase: SupabaseClient<Database>,
  params: ProductListParams
): Promise<PaginatedResult<Product>> {
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('status', 'active')
    .eq('stores.status', 'approved');

  if (params.region) {
    query = query.eq('stores.region', params.region);
  }

  if (params.categoryId) {
    query = query.eq('category_id', params.categoryId);
  }

  if (params.keyword) {
    query = query.ilike(
      'menu_items.name',
      `%${escapeILikePattern(params.keyword)}%`
    );
  }

  if (params.availableOnly) {
    query = query.gt('end_at', new Date().toISOString());
  }

  if (params.discountOption && params.discountOption !== 'all') {
    if (params.discountOption === 'over-40') {
      query = query.gte('discount_rate', 40);
    } else if (params.discountOption === '30-to-40') {
      query = query.gte('discount_rate', 30).lt('discount_rate', 40);
    } else if (params.discountOption === '20-to-30') {
      query = query.gte('discount_rate', 20).lt('discount_rate', 30);
    } else if (params.discountOption === 'under-20') {
      query = query.lt('discount_rate', 20);
    }
  }

  if (params.sort === 'discountRate') {
    query = query.order('discount_rate', {
      ascending: getSortOrder(params) === 'asc',
    });
  } else if (params.sort === 'discountPrice') {
    query = query.order('discount_price', {
      ascending: getSortOrder(params) === 'asc',
    });
  } else {
    query = query.order('end_at', {
      ascending: getSortOrder(params) === 'asc',
    });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  const totalCount = count ?? 0;

  return {
    items: ((data ?? []) as unknown as ProductRow[]).map(mapProductRow),
    page: params.page,
    pageSize: params.pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / params.pageSize),
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

function mapProductRow(row: ProductRow): Product {
  const availableStock = row.available_stock;
  const isSoldOut = availableStock <= 0;
  const isExpired = new Date(row.end_at) <= new Date();

  return mapProduct({
    id: row.id,
    storeId: row.store_id,
    storeName: row.stores.name,
    categoryId: row.categories?.id,
    categoryName: row.categories?.name,
    menuItemId: row.menu_items.id,
    name: row.menu_items.name,
    image: row.menu_items.image ?? undefined,
    originalPrice: row.original_price,
    discountPrice: row.discount_price,
    discountRate: row.discount_rate,
    stock: row.stock,
    reservedStock: row.reserved_stock,
    availableStock,
    isSoldOut,
    isExpired,
    displayStatus: getDisplayStatus(row.status, isSoldOut, isExpired),
    endAt: row.end_at,
    pickupStartTime: row.pickup_start_time,
    pickupEndTime: row.pickup_end_time,
    status: row.status,
    updatedAt: row.updated_at,
  });
}

function buildMockProductList(
  params: ProductListParams
): PaginatedResult<Product> {
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize;
  const filteredProducts = mockProductList.items.filter(
    (product) =>
      !params.region ||
      mockProductDetailsMap[product.id]?.store.region === params.region
  );
  const totalCount = filteredProducts.length;

  return {
    items: filteredProducts.slice(from, to).map(mapProduct),
    page: params.page,
    pageSize: params.pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / params.pageSize),
  };
}

function getDisplayStatus(
  status: 'active' | 'closed',
  isSoldOut: boolean,
  isExpired: boolean
): Product['displayStatus'] {
  if (status === 'closed') return 'closed';
  if (isExpired) return 'expired';
  if (isSoldOut) return 'soldOut';
  return 'available';
}

function getSortOrder(params: ProductListParams) {
  return params.order ?? 'asc';
}

function escapeILikePattern(pattern: string): string {
  return pattern.replace(/[%_]/g, '\\$&');
}
