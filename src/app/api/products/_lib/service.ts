import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  ProductDetailResponse,
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

export async function getProducts(
  supabase: SupabaseClient<Database>,
  params: ProductListParams
): Promise<ProductListResponse> {
  const { page, pageSize, region } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('status', 'active')
    .eq('stores.status', 'approved')
    .order('end_at', { ascending: true });

  if (region) {
    query = query.eq('stores.region', region);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const totalCount = count ?? 0;

  return {
    items: ((data ?? []) as unknown as ProductRow[]).map(mapProductRow),
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function getProductById(
  supabase: SupabaseClient<Database>,
  productId: string
): Promise<ProductDetailResponse> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
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
