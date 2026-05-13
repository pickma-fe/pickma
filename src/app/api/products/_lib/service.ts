import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  ProductDetailResponse,
  ProductListItemResponse,
  ProductListParams,
  ProductListResponse,
} from '@/contracts/product';
import {
  normalizeDiscountOptionId,
  normalizeSortOptionId,
  type ProductDiscountOptionId,
  type ProductSortOptionId,
} from '@/lib/consumerProductFilters';
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
  const { region, categoryId } = params;
  const shouldUseExtendedList =
    params.availableOnly ||
    categoryId ||
    params.discountOption ||
    params.sortOption;
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('status', 'active')
    .eq('stores.status', 'approved')
    .order('end_at', { ascending: true });

  if (region) {
    query = query.eq('stores.region', region);
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (!shouldUseExtendedList) {
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

  const { data, error } = await query;

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }
  return buildProductListResponse(
    ((data ?? []) as unknown as ProductRow[]).map(mapProductRow),
    params
  );
}

export function buildProductListResponse(
  products: ProductListItemResponse[],
  params: ProductListParams,
  getRegion?: (product: ProductListItemResponse) => string | undefined
): ProductListResponse {
  const { page, pageSize, region, categoryId } = params;
  const discountOption = normalizeDiscountOptionId(
    params.discountOption ?? 'all'
  );
  const sortOption = normalizeSortOptionId(params.sortOption ?? 'deadline');
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const filteredProducts = products
    .filter((product) => !params.availableOnly || isAvailableProduct(product))
    .filter((product) => !region || getRegion?.(product) === region)
    .filter((product) => !categoryId || product.categoryId === categoryId)
    .filter((product) => matchesDiscountOption(product, discountOption));
  const sortedProducts = [...filteredProducts].sort((a, b) =>
    compareProducts(a, b, sortOption)
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
    product.displayStatus === 'available' &&
    !product.isSoldOut &&
    !product.isExpired &&
    product.availableStock > 0
  );
}

function matchesDiscountOption(
  product: ProductListItemResponse,
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
  a: ProductListItemResponse,
  b: ProductListItemResponse,
  sortOption: ProductSortOptionId
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
