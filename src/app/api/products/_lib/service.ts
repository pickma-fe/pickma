import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import type {
  ProductDetailResponse,
  ProductDiscountOption,
  ProductListItemResponse,
  ProductListParams,
  ProductListResponse,
} from '@/contracts/product';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import type { Database } from '@/lib/supabase/database';

import { mapProductDetailRow, mapProductRow, type ProductRow } from './mapper';

const PRODUCT_SELECT = [
  'id',
  'store_id',
  'menu_item_id',
  'category_id',
  'discount_price',
  'stock',
  'reserved_stock',
  'end_at',
  'pickup_start_time',
  'pickup_end_time',
  'status',
  'updated_at',
  'menu_items!inner(id, name, description, image, original_price)',
  'categories(id, name)',
  'stores!inner(id, name, description, phone, address, address_detail, region, image)',
].join(', ');

const productListItemResponseSchema = z.object({
  id: z.uuid(),
  storeId: z.uuid(),
  storeName: z.string(),
  categoryId: z.uuid().optional(),
  categoryName: z.string().optional(),
  menuItemId: z.uuid(),
  name: z.string(),
  image: z.string().optional(),
  originalPrice: z.number(),
  discountPrice: z.number(),
  discountRate: z.number(),
  stock: z.number(),
  reservedStock: z.number(),
  availableStock: z.number(),
  isSoldOut: z.boolean(),
  isExpired: z.boolean(),
  displayStatus: z.enum(['available', 'soldOut', 'expired', 'closed']),
  endAt: z.string(),
  pickupStartTime: z.string(),
  pickupEndTime: z.string(),
  status: z.enum(['active', 'closed']),
  updatedAt: z.string(),
});

const productListResponseSchema: z.ZodType<ProductListResponse> = z.object({
  items: z.array(productListItemResponseSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export async function getProducts(
  supabase: SupabaseClient<Database>,
  params: ProductListParams
): Promise<ProductListResponse> {
  const { region, categoryId, keyword } = params;
  const shouldUseRpcList =
    isDiscountFilterOption(params.discountOption) ||
    params.sort === 'discountRate';
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  if (shouldUseRpcList) {
    const { data, error } = await supabase.rpc('list_public_products', {
      p_page: params.page,
      p_page_size: params.pageSize,
      p_region: region ?? null,
      p_category_id: categoryId ?? null,
      p_keyword: keyword ?? null,
      p_discount_option: params.discountOption ?? null,
      p_sort: params.sort ?? 'endAt',
      p_order: params.order ?? 'asc',
      p_available_only: params.availableOnly ?? false,
    });

    if (error) {
      throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    }

    const parsedResponse = productListResponseSchema.safeParse(data);

    if (!parsedResponse.success) {
      throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    }

    return parsedResponse.data;
  }

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('status', 'active')
    .eq('stores.status', 'approved');

  if (region) {
    query = query.eq('stores.region', region);
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (keyword) {
    query = query.ilike('menu_items.name', `%${escapeILikePattern(keyword)}%`);
  }

  if (params.availableOnly) {
    query = query.gt('end_at', new Date().toISOString());
  }

  if (params.sort === 'discountPrice') {
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
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
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

export function buildProductListResponse(
  products: ProductListItemResponse[],
  params: ProductListParams,
  getRegion?: (product: ProductListItemResponse) => string | undefined
): ProductListResponse {
  const { page, pageSize, region, categoryId, keyword } = params;
  const discountOption = params.discountOption ?? 'all';
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const filteredProducts = products
    .filter((product) => !params.availableOnly || isAvailableProduct(product))
    .filter((product) => !region || getRegion?.(product) === region)
    .filter((product) => !categoryId || product.categoryId === categoryId)
    .filter(
      (product) =>
        !keyword || product.name.toLowerCase().includes(keyword.toLowerCase())
    )
    .filter((product) => matchesDiscountOption(product, discountOption));
  const sortedProducts = [...filteredProducts].sort((a, b) =>
    compareProducts(a, b, params)
  );
  const totalCount = sortedProducts.length;

  return {
    items: sortedProducts.slice(from, to),
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

function isAvailableProduct(product: ProductListItemResponse) {
  return (
    product.status === 'active' &&
    !product.isExpired &&
    new Date(product.endAt).getTime() > Date.now()
  );
}

function matchesDiscountOption(
  product: ProductListItemResponse,
  discountOption: ProductDiscountOption
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

function isDiscountFilterOption(discountOption: string | undefined) {
  return Boolean(discountOption && discountOption !== 'all');
}

function compareProducts(
  a: ProductListItemResponse,
  b: ProductListItemResponse,
  params: ProductListParams
) {
  const sort = params.sort ?? 'endAt';
  const direction = getSortOrder(params) === 'asc' ? 1 : -1;

  if (sort === 'discountRate') {
    return (a.discountRate - b.discountRate) * direction;
  }

  if (sort === 'discountPrice') {
    return (a.discountPrice - b.discountPrice) * direction;
  }

  return (
    (new Date(a.endAt).getTime() - new Date(b.endAt).getTime()) * direction
  );
}

function getSortOrder(params: ProductListParams) {
  return params.order ?? 'asc';
}

function escapeILikePattern(pattern: string): string {
  return pattern.replace(/[%_]/g, '\\$&');
}

export async function getProductById(
  supabase: SupabaseClient<Database>,
  productId: string
): Promise<ProductDetailResponse> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .eq('status', 'active')
    .eq('stores.status', 'approved')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404);
    }
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (!data) {
    throw new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404);
  }

  return mapProductDetailRow(data as unknown as ProductRow);
}
