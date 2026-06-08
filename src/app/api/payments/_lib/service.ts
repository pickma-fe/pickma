import type {
  ConfirmPaymentRequest,
  PreparePaymentRequest,
  PreparePaymentResponse,
} from '@/contracts/payment';
import type { PaymentCompensationFailedPayload } from '@/contracts/payment-event';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { callTossCancel } from '@/app/api/_lib/toss-cancel';

import {
  buildTossCheckoutUrl,
  callTossConfirm,
  type TossConfirmResult,
} from './toss';

const PICKUP_NUMBER_DAILY_CAPACITY = 2574;

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
  if (order.status === 'reserved') {
    throw new AppError(ERROR_CODE.PAYMENT_ALREADY_CONFIRMED, 409);
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

  // Fast-fail guard: begin_payment_processing 호출을 막기 위한 사전 체크.
  // TOCTOU 경쟁이 존재하므로 최종 정합성은 confirm_payment RPC 내부에서 보장한다.
  const { data: seqRow, error: seqError } = await supabase
    .from('store_order_sequences')
    .select('last_sequence')
    .eq('store_id', order.store_id)
    .eq('pickup_service_date', order.pickup_service_date)
    .maybeSingle();
  if (seqError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (seqRow && seqRow.last_sequence >= PICKUP_NUMBER_DAILY_CAPACITY) {
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
        paymentKey: body.paymentKey,
        providerOrderId: body.orderNumber,
        method: 'card',
        methodDetail: null,
        pgResponse: {
          paymentKey: body.paymentKey,
          orderId: body.orderNumber,
          method: 'card',
          status: 'DONE',
          secret: null,
        },
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
    p_payment_key: confirmed.paymentKey,
    p_provider_order_id: confirmed.providerOrderId,
    p_method: confirmed.method,
    p_method_detail: confirmed.methodDetail ?? '',
    p_amount: order.payment_amount,
    p_pg_response: confirmed.pgResponse,
  });

  if (rpcError) {
    const shouldCancelToss = process.env.PAYMENT_MOCK !== 'true';
    if (shouldCancelToss) {
      try {
        await callTossCancel({
          orderNumber: body.orderNumber,
          paymentKey: confirmed.paymentKey,
          cancelReason: 'PickMa order confirmation failed',
          cancelAmount: order.payment_amount,
        });
      } catch {
        // cancel 실패: 결제 승인 + processing 잔류 — 30분 알람 대상
        await Promise.resolve(
          supabase.from('payment_events').insert({
            order_id: order.id,
            order_number: body.orderNumber,
            store_id: order.store_id,
            event_type: 'payment_compensation_failed',
            status: 'processed',
            processed_at: new Date().toISOString(),
            payload: {
              failureStage: 'toss_cancel',
              paymentStateAssumption: 'approved_may_remain',
              manualAction: 'check_toss_and_cancel_or_refund',
              orderStatus: 'processing',
              paymentKey: confirmed.paymentKey,
            } satisfies PaymentCompensationFailedPayload,
          })
        ).catch(() => {});
        throw mapConfirmRpcError(rpcError.message);
      }
    }
    // cancel 성공(또는 MOCK): revert 시도
    const { error: revertError } = await supabase.rpc(
      'revert_payment_processing',
      { p_order_id: order.id }
    );
    if (revertError) {
      // revert 실패: 결제는 취소됐지만 processing 잔류 — 30분 알람 대상
      await Promise.resolve(
        supabase.from('payment_events').insert({
          order_id: order.id,
          order_number: body.orderNumber,
          store_id: order.store_id,
          event_type: 'payment_compensation_failed',
          status: 'processed',
          processed_at: new Date().toISOString(),
          payload: {
            failureStage: 'revert_processing',
            paymentStateAssumption: 'cancelled_may_be_done',
            manualAction: 'restore_order_status',
            orderStatus: 'processing',
            paymentKey: confirmed.paymentKey,
          } satisfies PaymentCompensationFailedPayload,
        })
      ).catch(() => {});
    }
    throw mapConfirmRpcError(rpcError.message);
  }
}

const ADMIN_CANCEL_ALLOWED_STATUSES = new Set([
  'reserved',
  'accepted',
  'cancelling',
]);

export async function cancelPaymentById(
  paymentId: string,
  reason: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: payment, error: payError } = await supabase
    .from('payments')
    .select('id, payment_key, status, order_id')
    .eq('id', paymentId)
    .maybeSingle();

  if (payError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!payment) throw new AppError(ERROR_CODE.NOT_FOUND, 404);
  if (payment.status !== 'paid') {
    throw new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409);
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(
      'id, order_number, store_id, status, payment_amount, cancel_claimed_status'
    )
    .eq('id', payment.order_id)
    .single();

  if (orderError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!ADMIN_CANCEL_ALLOWED_STATUSES.has(order.status)) {
    throw new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409);
  }

  if (order.status !== 'cancelling') {
    const { error: claimError } = await supabase
      .from('orders')
      .update({
        status: 'cancelling',
        cancel_claimed_status: order.status,
        cancel_claimed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .eq('status', order.status);
    if (claimError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
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
      const revertStatus =
        order.status !== 'cancelling'
          ? order.status
          : (order.cancel_claimed_status ?? order.status);
      await supabase
        .from('orders')
        .update({
          status: revertStatus,
          cancel_claimed_status: null,
          cancel_claimed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);
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
