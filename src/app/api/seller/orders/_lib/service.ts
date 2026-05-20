import type {
  OrderDetailResponse,
  OrderListResponse,
  SellerOrderListParams,
} from '@/contracts/order';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { mapOrderDetailRow, mapOrderListRow } from './mapper';

const ORDER_LIST_SELECT =
  'id, order_number, store_id, total_amount, discount_amount, payment_amount, status, pickup_at, pickup_service_date, store_order_number, pickup_number, expires_at, created_at, updated_at, stores(name)';

const ORDER_DETAIL_SELECT =
  'id, order_number, store_id, total_amount, discount_amount, payment_amount, status, pickup_at, pickup_service_date, store_order_number, pickup_number, expires_at, cancelled_at, cancel_reason, picked_up_at, created_at, updated_at, stores(name), order_items(id, order_id, product_id, product_name, original_price, discount_price, quantity, subtotal, created_at), payments(id, order_id, provider, provider_payment_key, provider_order_id, method, method_detail, amount, status, paid_at, refunded_at, refund_reason, created_at, updated_at)';

export async function getSellerOrders(
  storeId: string,
  params: SellerOrderListParams
): Promise<OrderListResponse> {
  const supabase = createServiceRoleClient();
  const offset = (params.page - 1) * params.pageSize;

  let query = supabase
    .from('orders')
    .select(ORDER_LIST_SELECT, { count: 'exact' })
    .eq('store_id', storeId);

  if (params.status) {
    query = query.eq('status', params.status);
  }

  const { data, count, error } = await query
    .order(params.sort === 'createdAt' ? 'created_at' : 'pickup_at', {
      ascending: params.order === 'asc',
    })
    .range(offset, offset + params.pageSize - 1);

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  const totalCount = count ?? 0;
  return {
    items: (data ?? []).map((row) => mapOrderListRow(row)),
    page: params.page,
    pageSize: params.pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / params.pageSize),
  };
}

export async function getSellerOrder(
  storeId: string,
  orderId: string
): Promise<OrderDetailResponse> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_DETAIL_SELECT)
    .eq('id', orderId)
    .eq('store_id', storeId)
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!data) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);

  return mapOrderDetailRow(data);
}

export async function acceptSellerOrder(
  storeId: string,
  orderId: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'accepted' })
    .eq('id', orderId)
    .eq('store_id', storeId)
    .eq('status', 'reserved')
    .select('id');

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  if (!data || data.length === 0) {
    await assertOrderExists(storeId, orderId);
  }
}

export async function markSellerOrderReady(
  storeId: string,
  orderId: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'ready' })
    .eq('id', orderId)
    .eq('store_id', storeId)
    .eq('status', 'accepted')
    .select('id');

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  if (!data || data.length === 0) {
    await assertOrderExists(storeId, orderId);
  }
}

export async function completeSellerOrder(
  storeId: string,
  orderId: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'completed', picked_up_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('store_id', storeId)
    .eq('status', 'ready')
    .select('id');

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  if (!data || data.length === 0) {
    await assertOrderExists(storeId, orderId);
  }
}

async function assertOrderExists(
  storeId: string,
  orderId: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .eq('store_id', storeId)
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!data) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);
  throw new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409);
}
