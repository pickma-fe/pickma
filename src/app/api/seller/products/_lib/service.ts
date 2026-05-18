import type {
  CreateSellerProductRequest,
  ProductListItemResponse,
  UpdateSellerProductRequest,
} from '@/contracts/product';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { mapSellerProductRow, type SellerProductRow } from './mapper';

const SELLER_PRODUCT_SELECT = [
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
  'menu_items!inner(id, name, image, original_price)',
  'categories(id, name)',
  'stores!inner(id, name)',
].join(', ');

function mapDbError(error: { code?: string } | null): AppError {
  if (error?.code === 'PGRST116') {
    return new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404);
  }
  return new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
}

function assertStockCanUpdate(stock: number, reservedStock: number): void {
  if (stock < reservedStock) {
    throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400, undefined, [
      {
        path: 'stock',
        message: '재고는 예약된 수량보다 작을 수 없습니다.',
      },
    ]);
  }
}

export async function getSellerProducts(
  storeId: string
): Promise<ProductListItemResponse[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('products')
    .select(SELLER_PRODUCT_SELECT)
    .eq('store_id', storeId)
    .order('updated_at', { ascending: false });

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  return ((data ?? []) as unknown as SellerProductRow[]).map(
    mapSellerProductRow
  );
}

export async function createSellerProduct(
  storeId: string,
  body: CreateSellerProductRequest
): Promise<ProductListItemResponse> {
  const supabase = createServiceRoleClient();
  const { data: menuItem, error: menuItemError } = await supabase
    .from('menu_items')
    .select('id, store_id, category_id')
    .eq('id', body.menuItemId)
    .eq('store_id', storeId)
    .maybeSingle();

  if (menuItemError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!menuItem) throw new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404);

  const { data, error } = await supabase
    .from('products')
    .insert({
      store_id: storeId,
      menu_item_id: body.menuItemId,
      category_id: menuItem.category_id,
      discount_price: body.discountPrice,
      stock: body.stock,
      end_at: body.endAt,
      pickup_start_time: body.pickupStartTime,
      pickup_end_time: body.pickupEndTime,
    })
    .select(SELLER_PRODUCT_SELECT)
    .single();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!data) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  return mapSellerProductRow(data as unknown as SellerProductRow);
}

export async function updateSellerProduct(
  storeId: string,
  productId: string,
  body: UpdateSellerProductRequest
): Promise<ProductListItemResponse> {
  const supabase = createServiceRoleClient();
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, reserved_stock')
    .eq('id', productId)
    .eq('store_id', storeId)
    .maybeSingle();

  if (productError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!product) throw new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404);

  if (body.stock !== undefined) {
    assertStockCanUpdate(body.stock, product.reserved_stock);
  }

  const { data, error } = await supabase
    .from('products')
    .update({
      ...(body.discountPrice !== undefined && {
        discount_price: body.discountPrice,
      }),
      ...(body.stock !== undefined && { stock: body.stock }),
      ...(body.endAt !== undefined && { end_at: body.endAt }),
      ...(body.pickupStartTime !== undefined && {
        pickup_start_time: body.pickupStartTime,
      }),
      ...(body.pickupEndTime !== undefined && {
        pickup_end_time: body.pickupEndTime,
      }),
    })
    .eq('id', productId)
    .eq('store_id', storeId)
    .select(SELLER_PRODUCT_SELECT)
    .single();

  if (error) throw mapDbError(error);
  if (!data) throw new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404);

  return mapSellerProductRow(data as unknown as SellerProductRow);
}

export async function deleteSellerProduct(
  storeId: string,
  productId: string
): Promise<null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('products')
    .update({ status: 'closed' })
    .eq('id', productId)
    .eq('store_id', storeId)
    .select('id')
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!data) throw new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404);

  return null;
}
