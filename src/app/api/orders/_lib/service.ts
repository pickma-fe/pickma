import type { ValidationIssue } from '@/contracts/common';
import type {
  ConsumerOrderListParams,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetailResponse,
  OrderListResponse,
} from '@/contracts/order';
import type { PaymentCompensationFailedPayload } from '@/contracts/payment-event';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';
import type { Logger } from '@/app/api/_lib/logger';
import { callTossCancel } from '@/app/api/_lib/toss-cancel';

import {
  buildOrderName,
  mapCreateOrderResponse,
  mapOrderDetailRow,
  mapOrderListRow,
} from './mapper';

const ORDER_EXPIRES_MINUTES = 10;

const BEGIN_CANCEL_RPC_ERROR_MAP: Record<string, () => AppError> = {
  ORDER_NOT_FOUND: () => new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404),
  INVALID_ORDER_STATUS: () =>
    new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409),
};

const RPC_EXCEPTION_MAP: Record<string, () => AppError> = {
  PRODUCT_NOT_FOUND: () => new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404),
  PRODUCT_EXPIRED: () => new AppError(ERROR_CODE.PRODUCT_EXPIRED, 409),
  PRODUCT_NOT_AVAILABLE: () =>
    new AppError(ERROR_CODE.PRODUCT_NOT_AVAILABLE, 409),
  OUT_OF_STOCK: () => new AppError(ERROR_CODE.OUT_OF_STOCK, 409),
  DUPLICATE_PRODUCT_IN_ORDER: () =>
    new AppError(ERROR_CODE.DUPLICATE_PRODUCT_IN_ORDER, 400),
  ORDER_NUMBER_EXHAUSTED: () =>
    new AppError(ERROR_CODE.ORDER_NUMBER_EXHAUSTED, 503),
};

const RPC_VALIDATION_EXCEPTIONS = new Set([
  'EMPTY_ITEMS',
  'INVALID_ITEM_FORMAT',
  'INVALID_PICKUP_TIME',
  'MULTIPLE_STORES_NOT_ALLOWED',
]);

function mapRpcError(message: string): AppError {
  if (RPC_EXCEPTION_MAP[message]) return RPC_EXCEPTION_MAP[message]();
  if (RPC_VALIDATION_EXCEPTIONS.has(message)) {
    const details: ValidationIssue[] =
      message === 'INVALID_PICKUP_TIME'
        ? [{ path: 'pickupAt', message: '픽업 가능 시간 범위를 벗어났습니다.' }]
        : [{ path: 'items', message }];
    return new AppError(ERROR_CODE.VALIDATION_ERROR, 400, undefined, details);
  }
  return new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
}

export async function cancelOrder(
  userId: string,
  orderId: string,
  reason: string,
  logger: Logger
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(
      'id, status, order_number, payment_amount, store_id, payments(payment_key)'
    )
    .eq('id', orderId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!order) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);
  if (order.status !== 'reserved')
    throw new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409);

  const paymentRow = Array.isArray(order.payments)
    ? order.payments[0]
    : order.payments;
  const paymentKey = paymentRow?.payment_key ?? null;

  const { error: beginError } = await supabase.rpc('begin_order_cancel', {
    p_order_id: orderId,
    p_user_id: userId,
  });
  if (beginError) {
    const mapped = BEGIN_CANCEL_RPC_ERROR_MAP[beginError.message];
    throw mapped?.() ?? new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (process.env.PAYMENT_MOCK !== 'true') {
    if (!paymentKey) {
      await supabase.rpc('revert_order_cancel_claim', { p_order_id: orderId });
      throw new AppError(ERROR_CODE.PAYMENT_CANCEL_FAILED, 502);
    }
    try {
      await callTossCancel({
        orderNumber: order.order_number,
        paymentKey,
        cancelReason: reason,
        cancelAmount: order.payment_amount,
      });
    } catch {
      const { error: revertError } = await supabase.rpc(
        'revert_order_cancel_claim',
        { p_order_id: orderId }
      );
      if (revertError) {
        logger.error('CONSUMER_ORDER_CANCEL_REVERT_FAILED', {
          orderId,
          orderNumber: order.order_number,
          paymentKey: paymentKey ?? undefined,
        });
        await Promise.resolve(
          supabase.from('payment_events').insert({
            order_id: orderId,
            order_number: order.order_number,
            store_id: order.store_id,
            event_type: 'payment_compensation_failed',
            status: 'processed',
            processed_at: new Date().toISOString(),
            payload: {
              failureStage: 'revert_processing',
              paymentStateAssumption: 'approved_may_remain',
              manualAction: 'restore_order_status',
              orderStatus: 'cancelling',
              paymentKey,
            } satisfies PaymentCompensationFailedPayload,
          })
        ).catch(() => {});
      }
      throw new AppError(ERROR_CODE.PAYMENT_CANCEL_FAILED, 502);
    }
  }

  const { error: finalizeError } = await supabase.rpc('cancel_order', {
    p_order_id: orderId,
    p_reason: reason,
  });
  if (finalizeError) {
    logger.error('CONSUMER_ORDER_CANCEL_FINALIZE_FAILED', {
      orderId,
      orderNumber: order.order_number,
      paymentKey: paymentKey ?? undefined,
    });
    await Promise.resolve(
      supabase.from('payment_events').insert({
        order_id: orderId,
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
          paymentKey,
        } satisfies PaymentCompensationFailedPayload,
      })
    ).catch(() => {});
    throw new AppError(ERROR_CODE.PAYMENT_CANCEL_FAILED, 502);
  }
}

export async function getOrders(
  userId: string,
  params: ConsumerOrderListParams
): Promise<OrderListResponse> {
  const supabase = createServiceRoleClient();
  const offset = (params.page - 1) * params.pageSize;

  let query = supabase
    .from('orders')
    .select(
      'id, order_number, store_id, total_amount, discount_amount, payment_amount, status, pickup_at, pickup_service_date, store_order_number, pickup_number, expires_at, created_at, updated_at, stores(name), order_items(products(menu_items(image)))',
      { count: 'exact' }
    )
    .eq('user_id', userId);

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

export async function getOrder(
  userId: string,
  orderId: string
): Promise<OrderDetailResponse> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, order_number, store_id, total_amount, discount_amount, payment_amount, status, pickup_at, pickup_service_date, store_order_number, pickup_number, expires_at, cancelled_at, cancel_reason, picked_up_at, created_at, updated_at, stores(name), order_items(id, order_id, product_id, product_name, original_price, discount_price, quantity, subtotal, created_at), payments(id, order_id, payment_key, provider_order_id, method, method_detail, amount, status, paid_at, refunded_at, refund_reason, created_at, updated_at)'
    )
    .eq('id', orderId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!data) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);

  return mapOrderDetailRow(data);
}

export async function createOrder(
  userId: string,
  body: CreateOrderRequest
): Promise<CreateOrderResponse> {
  const supabase = createServiceRoleClient();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ORDER_EXPIRES_MINUTES * 60 * 1000);

  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    'create_order',
    {
      p_user_id: userId,
      p_items: [{ product_id: body.productId, quantity: body.quantity }],
      p_pickup_at: body.pickupAt,
      p_expires_at: expiresAt.toISOString(),
    }
  );

  if (rpcError) throw mapRpcError(rpcError.message);
  if (!rpcResult?.[0])
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  const { order_id, order_number, payment_amount } = rpcResult[0];

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('product_name, quantity')
    .eq('order_id', order_id);

  if (itemsError || !items?.length) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const orderName = buildOrderName(items);

  return mapCreateOrderResponse({
    orderId: order_id,
    orderNumber: order_number,
    orderName,
    paymentAmount: payment_amount,
    expiresAt: expiresAt.toISOString(),
  });
}
