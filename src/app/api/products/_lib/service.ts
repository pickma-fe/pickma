import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  ProductDetailResponse,
  ProductListParams,
  ProductListResponse,
} from '@/contracts/product';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import type { Database } from '@/lib/supabase/database';

import {
  mapProductDetailRow,
  mapProductRow,
  mapRpcProductRow,
  type ProductRow,
  type RpcProductRow,
} from './mapper';

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
  'menu_items!inner(id, name, description, image)',
  'categories(id, name)',
  'stores!inner(id, name, description, phone, address, address_detail, region, image, latitude, longitude)',
].join(', ');

export async function getProducts(
  supabase: SupabaseClient<Database>,
  params: ProductListParams
): Promise<ProductListResponse> {
  if (
    params.sort === 'distance' &&
    params.userLat !== undefined &&
    params.userLng !== undefined
  ) {
    return getProductsNear(supabase, params);
  }

  const { categoryId, keyword } = params;
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('status', 'active')
    .eq('stores.status', 'active')
    .eq('stores.operation_status', 'open');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (keyword) {
    query = query.ilike('menu_items.name', `%${escapeILikePattern(keyword)}%`);
  }

  if (params.minPrice !== undefined) {
    query = query.gte('discount_price', params.minPrice);
  }

  if (params.maxPrice !== undefined) {
    query = query.lt('discount_price', params.maxPrice);
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

function getDiscountRateRange(
  discountOption: ProductListParams['discountOption']
): { min: number | undefined; max: number | undefined } {
  switch (discountOption) {
    case 'over-40':
      return { min: 40, max: undefined };
    case '30-to-40':
      return { min: 30, max: 40 };
    case '20-to-30':
      return { min: 20, max: 30 };
    case 'under-20':
      return { min: undefined, max: 20 };
    default:
      return { min: undefined, max: undefined };
  }
}

async function getProductsNear(
  supabase: SupabaseClient<Database>,
  params: ProductListParams
): Promise<ProductListResponse> {
  const discountRange = getDiscountRateRange(params.discountOption);
  const { data, error } = await supabase.rpc('get_products_near', {
    p_user_lat: params.userLat as number,
    p_user_lng: params.userLng as number,
    p_radius_km: 3.0,
    p_page: params.page,
    p_page_size: params.pageSize,
    p_category_id: params.categoryId ?? undefined,
    p_keyword: params.keyword ?? undefined,
    p_min_price: params.minPrice ?? undefined,
    p_max_price: params.maxPrice ?? undefined,
    p_available_only: params.availableOnly ?? true,
    p_min_discount_rate: discountRange.min,
    p_max_discount_rate: discountRange.max,
  });

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  const rows = (data ?? []) as unknown as RpcProductRow[];
  const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

  return {
    items: rows.map(mapRpcProductRow),
    page: params.page,
    pageSize: params.pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / params.pageSize),
  };
}

function getSortOrder(params: ProductListParams): 'asc' | 'desc' {
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
    .eq('stores.status', 'active')
    .eq('stores.operation_status', 'open')
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
