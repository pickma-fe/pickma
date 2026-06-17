import type {
  OrderDetailResponse,
  OrderListResponse,
  SellerOrderListParams,
  SellerOrderSummaryResponse,
} from '@/contracts/order';
import type { PaymentCompensationFailedPayload } from '@/contracts/payment-event';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServerClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import {
  mapOrderDetailRow,
  mapOrderListRow,
} from '@/app/api/_lib/order-mapper';
import { callTossCancel } from '@/app/api/_lib/toss-cancel';

import {
  createEmptySellerOrderSummary,
  SELLER_ORDER_SUMMARY_STATUSES,
  SELLER_ORDER_SUMMARY_STATUS_KEY_MAP,
  type SellerOrderSummaryStatus,
} from './summary';

const ORDER_LIST_SELECT =
  'id, order_number, store_id, total_amount, discount_amount, payment_amount, status, pickup_at, pickup_service_date, store_order_number, pickup_number, expires_at, created_at, updated_at, stores(name)';

const ORDER_DETAIL_SELECT =
  'id, order_number, store_id, total_amount, discount_amount, payment_amount, status, pickup_at, pickup_service_date, store_order_number, pickup_number, expires_at, cancelled_at, cancel_reason, picked_up_at, created_at, updated_at, stores(name), order_items(id, order_id, product_id, product_name, original_price, discount_price, quantity, subtotal, created_at), payments(id, order_id, payment_key, provider_order_id, method, method_detail, amount, status, paid_at, refunded_at, refund_reason, created_at, updated_at)';

type ServerClient = Awaited<ReturnType<typeof createServerClient>>;

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

async function countSellerOrders(
  supabase: ServerClient,
  storeId: string,
  status?: SellerOrderSummaryStatus
): Promise<number> {
  let query = supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', storeId);

  if (status) {
    query = query.eq('status', status);
  }

  const { count, error } = await query;

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  return count ?? 0;
}

export async function getSellerOrderSummary(
  storeId: string
): Promise<SellerOrderSummaryResponse> {
  const supabase = await createServerClient();
  const [totalCount, ...statusCounts] = await Promise.all([
    countSellerOrders(supabase, storeId),
    ...SELLER_ORDER_SUMMARY_STATUSES.map((status) =>
      countSellerOrders(supabase, storeId, status)
    ),
  ]);

  return SELLER_ORDER_SUMMARY_STATUSES.reduce<SellerOrderSummaryResponse>(
    (summary, status, index) => {
      summary.statusCounts[SELLER_ORDER_SUMMARY_STATUS_KEY_MAP[status]] =
        statusCounts[index] ?? 0;
      return summary;
    },
    { ...createEmptySellerOrderSummary(), totalCount }
  );
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

export async function noShowSellerOrder(
  storeId: string,
  orderId: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'no_show' })
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

const CANCEL_ORDER_SELECT =
  'id, order_number, store_id, status, payment_amount, cancel_claimed_status, payments(id, payment_key, status)';

const SELLER_CANCEL_ALLOWED_STATUSES = new Set(['reserved', 'accepted']);

export async function cancelSellerOrder(
  storeId: string,
  orderId: string,
  reason: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(CANCEL_ORDER_SELECT)
    .eq('id', orderId)
    .eq('store_id', storeId)
    .maybeSingle();

  if (orderError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!order) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);

  const payment = Array.isArray(order.payments) ? order.payments[0] : null;
  if (payment?.status !== 'paid') {
    throw new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409);
  }

  if (!SELLER_CANCEL_ALLOWED_STATUSES.has(order.status)) {
    throw new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409);
  }

  const { data: claimed, error: claimError } = await supabase
    .from('orders')
    .update({
      status: 'cancelling',
      cancel_claimed_status: order.status,
      cancel_claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .eq('store_id', storeId)
    .eq('status', order.status)
    .select('id');

  if (claimError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!claimed || claimed.length === 0) {
    await assertOrderExists(storeId, orderId);
  }

  if (process.env.PAYMENT_MOCK !== 'true') {
    if (!payment.payment_key) {
      throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    }
    try {
      await callTossCancel({
        orderNumber: order.order_number,
        paymentKey: payment.payment_key,
        cancelReason: reason,
        cancelAmount: order.payment_amount,
      });
    } catch {
      const revertStatus = order.cancel_claimed_status ?? order.status;
      await supabase
        .from('orders')
        .update({
          status: revertStatus,
          cancel_claimed_status: null,
          cancel_claimed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('status', 'cancelling');
      throw new AppError(ERROR_CODE.PAYMENT_CANCEL_FAILED, 502);
    }
  }

  const { error: finalizeError } = await supabase.rpc('cancel_order', {
    p_order_id: order.id,
    p_reason: reason,
  });
  if (finalizeError) {
    await Promise.resolve(
      supabase.from('payment_events').insert({
        order_id: order.id,
        order_number: order.order_number,
        store_id: order.store_id,
        event_type: 'payment_compensation_failed',
        status: 'processed',
        processed_at: new Date().toISOString(),
        payload: {
          failureStage: 'cancel_finalize',
          paymentStateAssumption: 'toss_cancelled_db_pending',
          manualAction: 'finalize_order_cancel_manually',
          orderStatus: 'cancelling',
          paymentKey: payment.payment_key,
        } satisfies PaymentCompensationFailedPayload,
      })
    ).catch(() => {});
    throw new AppError(ERROR_CODE.PAYMENT_CANCEL_FAILED, 502);
  }
}
