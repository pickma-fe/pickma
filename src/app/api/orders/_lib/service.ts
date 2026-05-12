import type { ValidationIssue } from '@/contracts/common';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
} from '@/contracts/order';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { buildOrderName, mapCreateOrderResponse } from './mapper';

const ORDER_EXPIRES_MINUTES = 10;

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

export async function expireUserOrders(userId: string): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    const { data: expired, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'payment_pending')
      .lt('expires_at', new Date().toISOString());
    if (error || !expired?.length) return;
    for (const order of expired) {
      try {
        await supabase.rpc('expire_order', { p_order_id: order.id });
      } catch {
        // best-effort cleanup: 개별 실패는 주문 생성을 막지 않는다.
      }
    }
  } catch {
    // best-effort cleanup: 조회/예상 밖 실패도 주문 생성을 막지 않는다.
  }
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
