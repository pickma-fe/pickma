import type {
  ConfirmPaymentRequest,
  PreparePaymentRequest,
  PreparePaymentResponse,
} from '@/contracts/payment';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import {
  buildTossCheckoutUrl,
  callTossConfirm,
  type TossConfirmResult,
} from './toss';

const BEGIN_RPC_ERROR_MAP: Record<string, () => AppError> = {
  ORDER_NOT_FOUND: () => new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404),
  INVALID_ORDER_STATUS: () =>
    new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409),
  ORDER_EXPIRED: () => new AppError(ERROR_CODE.ORDER_EXPIRED, 409),
};

const CONFIRM_RPC_ERROR_MAP: Record<string, () => AppError> = {
  INVALID_ORDER_STATUS: () =>
    new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409),
  ORDER_EXPIRED: () => new AppError(ERROR_CODE.ORDER_EXPIRED, 409),
  PAYMENT_AMOUNT_MISMATCH: () =>
    new AppError(ERROR_CODE.PAYMENT_AMOUNT_MISMATCH, 400),
  PICKUP_NUMBER_EXHAUSTED: () =>
    new AppError(ERROR_CODE.PICKUP_NUMBER_EXHAUSTED, 409),
};

function mapBeginRpcError(message: string): AppError {
  return (
    BEGIN_RPC_ERROR_MAP[message]?.() ??
    new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500)
  );
}

function mapConfirmRpcError(message: string): AppError {
  return (
    CONFIRM_RPC_ERROR_MAP[message]?.() ??
    new AppError(ERROR_CODE.PAYMENT_CONFIRM_FAILED, 500)
  );
}

export async function preparePayment(
  userId: string,
  body: PreparePaymentRequest,
  successUrl: string
): Promise<PreparePaymentResponse> {
  const supabase = createServiceRoleClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, payment_amount, status, expires_at')
    .eq('order_number', body.orderNumber)
    .eq('user_id', userId)
    .eq('status', 'payment_pending')
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!order) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);
  if (order.expires_at && new Date(order.expires_at) <= new Date()) {
    const { error: expireError } = await supabase.rpc('expire_order', {
      p_order_id: order.id,
    });
    if (expireError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    throw new AppError(ERROR_CODE.ORDER_EXPIRED, 409);
  }

  let redirectUrl: string;
  if (process.env.PAYMENT_MOCK === 'true') {
    const paymentKey = `mock_pk_${Date.now()}_${body.orderNumber}`;
    redirectUrl = `${successUrl}?paymentKey=${paymentKey}&orderId=${body.orderNumber}&amount=${order.payment_amount}`;
  } else {
    redirectUrl = buildTossCheckoutUrl({
      orderNumber: body.orderNumber,
      amount: order.payment_amount,
      orderName: body.orderName,
    });
  }

  return {
    redirectUrl,
    orderNumber: body.orderNumber,
    amount: order.payment_amount,
    expiresAt: order.expires_at ?? undefined,
  };
}

export async function confirmPayment(
  userId: string,
  body: ConfirmPaymentRequest
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(
      'id, payment_amount, status, expires_at, store_id, pickup_service_date'
    )
    .eq('order_number', body.orderNumber)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!order) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);
  if (order.status === 'expired') {
    throw new AppError(ERROR_CODE.ORDER_EXPIRED, 409);
  }
  if (order.status !== 'payment_pending') {
    throw new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409);
  }
  if (order.expires_at && new Date(order.expires_at) <= new Date()) {
    const { error: expireError } = await supabase.rpc('expire_order', {
      p_order_id: order.id,
    });
    if (expireError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    throw new AppError(ERROR_CODE.ORDER_EXPIRED, 409);
  }
  if (order.payment_amount !== body.amount) {
    throw new AppError(ERROR_CODE.PAYMENT_AMOUNT_MISMATCH, 400);
  }

  const { data: seqRow, error: seqError } = await supabase
    .from('store_order_sequences')
    .select('last_sequence')
    .eq('store_id', order.store_id)
    .eq('pickup_service_date', order.pickup_service_date)
    .maybeSingle();
  if (seqError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (seqRow && seqRow.last_sequence >= 2574) {
    throw new AppError(ERROR_CODE.PICKUP_NUMBER_EXHAUSTED, 409);
  }

  const { error: beginError } = await supabase.rpc('begin_payment_processing', {
    p_order_id: order.id,
  });
  if (beginError) throw mapBeginRpcError(beginError.message);

  let confirmed: TossConfirmResult;

  try {
    if (process.env.PAYMENT_MOCK === 'true') {
      confirmed = {
        providerPaymentKey: body.paymentKey,
        providerOrderId: body.orderNumber,
        method: 'card',
        methodDetail: null,
      };
    } else {
      confirmed = await callTossConfirm({
        paymentKey: body.paymentKey,
        orderNumber: body.orderNumber,
        amount: order.payment_amount,
      });
    }
  } catch (e) {
    await supabase.rpc('revert_payment_processing', { p_order_id: order.id });
    if (e instanceof AppError) throw e;
    throw new AppError(ERROR_CODE.PAYMENT_CONFIRM_FAILED, 500);
  }

  const { error: rpcError } = await supabase.rpc('confirm_payment', {
    p_order_number: body.orderNumber,
    p_provider: 'toss',
    p_provider_payment_key: confirmed.providerPaymentKey,
    p_provider_order_id: confirmed.providerOrderId,
    p_method: confirmed.method,
    p_method_detail: confirmed.methodDetail ?? '',
    p_amount: order.payment_amount,
  });

  if (rpcError) throw mapConfirmRpcError(rpcError.message);
}
