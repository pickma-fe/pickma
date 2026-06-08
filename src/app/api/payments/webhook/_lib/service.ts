import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import type { Json } from '@/lib/supabase/database';
import { createServiceRoleClient } from '@/lib/supabase/service';

import type { DepositCallbackBody, PaymentStatusChangedBody } from './schemas';

type WebhookBody = PaymentStatusChangedBody | DepositCallbackBody;

function isPaymentStatusChanged(
  body: WebhookBody
): body is PaymentStatusChangedBody {
  return 'eventType' in body && body.eventType === 'PAYMENT_STATUS_CHANGED';
}

export async function processWebhook(
  transmissionId: string | null,
  body: WebhookBody
): Promise<void> {
  const supabase = createServiceRoleClient();

  // 멱등: 동일 transmissionId가 이미 기록된 경우 즉시 반환
  if (transmissionId !== null) {
    const { data: existing, error: existingError } = await supabase
      .from('payment_events')
      .select('id')
      .eq('provider_event_id', transmissionId)
      .maybeSingle();
    if (existingError)
      throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    if (existing !== null) return;
  }

  if (isPaymentStatusChanged(body)) {
    await processPaymentStatusChanged(supabase, transmissionId, body);
  } else {
    await processDepositCallback(supabase, transmissionId, body);
  }
}

type SupabaseClient = ReturnType<typeof createServiceRoleClient>;

async function processPaymentStatusChanged(
  supabase: SupabaseClient,
  transmissionId: string | null,
  body: PaymentStatusChangedBody
): Promise<void> {
  const orderNumber = body.data.orderId;

  // orders 조회
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, order_number, store_id, payment_amount')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (orderError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (order === null) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);

  // payments 조회
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id, payment_key, method')
    .eq('order_id', order.id)
    .maybeSingle();
  if (paymentError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  const paymentKey = body.data.paymentKey;

  // 금액 검증
  if (body.data.totalAmount !== order.payment_amount) {
    await insertFailedEvent(supabase, {
      orderId: order.id,
      orderNumber: order.order_number,
      storeId: order.store_id,
      paymentId: payment?.id ?? null,
      transmissionId,
      paymentKey,
      providerEventType: 'PAYMENT_STATUS_CHANGED',
      payload: body,
      errorMessage: 'totalAmount mismatch',
    });
    throw new AppError(ERROR_CODE.INVALID_WEBHOOK_PAYLOAD, 400);
  }

  // payment 없음 검증
  if (payment === null) {
    await insertFailedEvent(supabase, {
      orderId: order.id,
      orderNumber: order.order_number,
      storeId: order.store_id,
      paymentId: null,
      transmissionId,
      paymentKey,
      providerEventType: 'PAYMENT_STATUS_CHANGED',
      payload: body,
      errorMessage: 'payment not found',
    });
    throw new AppError(ERROR_CODE.INVALID_WEBHOOK_PAYLOAD, 400);
  }

  // paymentKey 검증
  if (body.data.paymentKey !== payment.payment_key) {
    await insertFailedEvent(supabase, {
      orderId: order.id,
      orderNumber: order.order_number,
      storeId: order.store_id,
      paymentId: payment.id,
      transmissionId,
      paymentKey: payment.payment_key,
      providerEventType: 'PAYMENT_STATUS_CHANGED',
      payload: body,
      errorMessage: 'paymentKey mismatch',
    });
    throw new AppError(ERROR_CODE.INVALID_WEBHOOK_PAYLOAD, 400);
  }

  // method 검증 (body에 method가 있을 때만)
  if (body.data.method !== undefined && body.data.method !== payment.method) {
    await insertFailedEvent(supabase, {
      orderId: order.id,
      orderNumber: order.order_number,
      storeId: order.store_id,
      paymentId: payment.id,
      transmissionId,
      paymentKey: payment.payment_key,
      providerEventType: 'PAYMENT_STATUS_CHANGED',
      payload: body,
      errorMessage: 'method mismatch',
    });
    throw new AppError(ERROR_CODE.INVALID_WEBHOOK_PAYLOAD, 400);
  }

  await insertAndProcessEvent(supabase, {
    orderId: order.id,
    orderNumber: order.order_number,
    storeId: order.store_id,
    paymentId: payment.id,
    transmissionId,
    paymentKey: payment.payment_key,
    providerEventType: 'PAYMENT_STATUS_CHANGED',
    payload: body,
  });
}

async function processDepositCallback(
  supabase: SupabaseClient,
  transmissionId: string | null,
  body: DepositCallbackBody
): Promise<void> {
  const orderNumber = body.orderId;

  // orders 조회
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, order_number, store_id, payment_amount')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (orderError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (order === null) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404);

  // payments 조회
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id, payment_key, method, pg_response')
    .eq('order_id', order.id)
    .maybeSingle();
  if (paymentError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  // payment 없음 검증
  if (payment === null) {
    await insertFailedEvent(supabase, {
      orderId: order.id,
      orderNumber: order.order_number,
      storeId: order.store_id,
      paymentId: null,
      transmissionId,
      paymentKey: null,
      providerEventType: 'DEPOSIT_CALLBACK',
      payload: body,
      errorMessage: 'payment not found',
    });
    throw new AppError(ERROR_CODE.INVALID_WEBHOOK_PAYLOAD, 400);
  }

  // 가상계좌 결제수단 검증
  if (payment.method !== 'virtual_account') {
    await insertFailedEvent(supabase, {
      orderId: order.id,
      orderNumber: order.order_number,
      storeId: order.store_id,
      paymentId: payment.id,
      transmissionId,
      paymentKey: payment.payment_key,
      providerEventType: 'DEPOSIT_CALLBACK',
      payload: body,
      errorMessage: 'method is not virtual_account',
    });
    throw new AppError(ERROR_CODE.INVALID_WEBHOOK_PAYLOAD, 400);
  }

  // secret 검증
  const pgResponse = payment.pg_response as Record<string, unknown> | null;
  const storedSecret = pgResponse?.secret as string | undefined | null;
  if (!storedSecret || body.secret !== storedSecret) {
    await insertFailedEvent(supabase, {
      orderId: order.id,
      orderNumber: order.order_number,
      storeId: order.store_id,
      paymentId: payment.id,
      transmissionId,
      paymentKey: payment.payment_key,
      providerEventType: 'DEPOSIT_CALLBACK',
      payload: body,
      errorMessage: 'secret mismatch',
    });
    throw new AppError(ERROR_CODE.INVALID_WEBHOOK_PAYLOAD, 400);
  }

  await insertAndProcessEvent(supabase, {
    orderId: order.id,
    orderNumber: order.order_number,
    storeId: order.store_id,
    paymentId: payment.id,
    transmissionId,
    paymentKey: payment.payment_key,
    providerEventType: 'DEPOSIT_CALLBACK',
    payload: body,
  });
}

interface EventParams {
  orderId: string;
  orderNumber: string;
  storeId: string | null;
  paymentId: string | null;
  transmissionId: string | null;
  paymentKey: string | null;
  providerEventType: string;
  payload: unknown;
}

async function insertAndProcessEvent(
  supabase: SupabaseClient,
  params: EventParams
): Promise<void> {
  const { data: inserted, error: insertError } = await supabase
    .from('payment_events')
    .insert({
      event_type: 'payment_webhook_received',
      status: 'pending',
      order_id: params.orderId,
      order_number: params.orderNumber,
      store_id: params.storeId,
      payment_id: params.paymentId,
      payment_key: params.paymentKey,
      provider_event_id: params.transmissionId,
      provider_event_type: params.providerEventType,
      payload: params.payload as Json,
    })
    .select('id')
    .single();

  if (insertError) {
    // provider_event_id unique violation — 동시 중복 webhook
    if (insertError.code === '23505') return;
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const { error: updateError } = await supabase
    .from('payment_events')
    .update({ status: 'processed', processed_at: new Date().toISOString() })
    .eq('id', inserted.id);
  if (updateError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
}

interface FailedEventParams extends EventParams {
  errorMessage: string;
}

async function insertFailedEvent(
  supabase: SupabaseClient,
  params: FailedEventParams
): Promise<void> {
  await Promise.resolve(
    supabase.from('payment_events').insert({
      event_type: 'payment_webhook_received',
      status: 'failed',
      order_id: params.orderId,
      order_number: params.orderNumber,
      store_id: params.storeId,
      payment_id: params.paymentId,
      payment_key: params.paymentKey,
      provider_event_id: params.transmissionId,
      provider_event_type: params.providerEventType,
      payload: params.payload as Json,
      error_message: params.errorMessage,
    })
  ).catch(() => {});
}
