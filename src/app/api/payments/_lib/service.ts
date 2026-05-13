import type {
  ConfirmPaymentRequest,
  PreparePaymentRequest,
  PreparePaymentResponse,
} from '@/contracts/payment';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { getPaymentProviderAdapter } from './providers';

const CONFIRM_RPC_ERROR_MAP: Record<string, () => AppError> = {
  INVALID_ORDER_STATUS: () =>
    new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409),
  ORDER_EXPIRED: () => new AppError(ERROR_CODE.ORDER_EXPIRED, 409),
  PAYMENT_AMOUNT_MISMATCH: () =>
    new AppError(ERROR_CODE.PAYMENT_AMOUNT_MISMATCH, 400),
  PICKUP_NUMBER_EXHAUSTED: () =>
    new AppError(ERROR_CODE.PICKUP_NUMBER_EXHAUSTED, 409),
};

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
    .select('order_number, payment_amount, status, expires_at')
    .eq('order_number', body.orderNumber)
    .eq('user_id', userId)
    .eq('status', 'payment_pending')
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!order) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);
  if (order.expires_at && new Date(order.expires_at) <= new Date()) {
    throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);
  }

  const adapter = getPaymentProviderAdapter(body.provider);
  const result = await adapter.prepare({
    orderNumber: body.orderNumber,
    amount: order.payment_amount,
    expiresAt: order.expires_at ?? new Date().toISOString(),
    provider: body.provider,
    successUrl,
  });

  return {
    provider: body.provider,
    flow: 'redirect',
    redirectUrl: result.redirectUrl,
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
    .select('payment_amount, status, expires_at')
    .eq('order_number', body.orderNumber)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!order) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);
  if (order.status !== 'payment_pending') {
    throw new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409);
  }
  if (order.expires_at && new Date(order.expires_at) <= new Date()) {
    throw new AppError(ERROR_CODE.ORDER_EXPIRED, 409);
  }
  if (order.payment_amount !== body.amount) {
    throw new AppError(ERROR_CODE.PAYMENT_AMOUNT_MISMATCH, 400);
  }

  const adapter = getPaymentProviderAdapter(body.provider);
  const confirmed = await adapter.confirm({
    orderNumber: body.orderNumber,
    amount: body.amount,
  });

  const { error: rpcError } = await supabase.rpc('confirm_payment', {
    p_order_number: body.orderNumber,
    p_provider: body.provider,
    p_provider_payment_key: confirmed.providerPaymentKey,
    p_provider_order_id: confirmed.providerOrderId,
    p_method: confirmed.method,
    p_method_detail: confirmed.methodDetail ?? '',
    p_amount: body.amount,
  });

  if (rpcError) throw mapConfirmRpcError(rpcError.message);
}
