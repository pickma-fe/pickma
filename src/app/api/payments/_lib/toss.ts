import type { PaymentMethod } from '@/types/payment';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';

export interface TossConfirmResult {
  providerPaymentKey: string;
  providerOrderId: string;
  method: PaymentMethod;
  methodDetail: string | null;
}

const TOSS_CONFIRM_ERROR_MAP: Record<string, () => AppError> = {
  ALREADY_PROCESSED_PAYMENT: () =>
    new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409),
  PAYMENT_AMOUNT_MISMATCH: () =>
    new AppError(ERROR_CODE.PAYMENT_AMOUNT_MISMATCH, 400),
  NOT_FOUND_PAYMENT: () => new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404),
};

const CARD_REJECTION_CODES = new Set([
  'INVALID_STOPPED_CARD',
  'INVALID_REJECT_CARD',
  'EXCEED_MAX_DAILY_PAYMENT_COUNT',
  'EXCEED_MAX_PAYMENT_AMOUNT',
  'INVALID_CARD_EXPIRATION',
]);

const TOSS_METHOD_MAP: Record<string, PaymentMethod> = {
  카드: 'card',
  가상계좌: 'virtual_account',
  휴대폰: 'mobile',
  간편결제: 'easy_pay',
};

export function buildTossCheckoutUrl(params: {
  orderNumber: string;
  amount: number;
  orderName: string;
}): string {
  const query = new URLSearchParams({
    orderNumber: params.orderNumber,
    amount: String(params.amount),
    orderName: params.orderName,
  });
  return `/payment/toss-checkout?${query.toString()}`;
}

export async function callTossConfirm(params: {
  paymentKey: string;
  orderNumber: string;
  amount: number;
}): Promise<TossConfirmResult> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const credentials = Buffer.from(`${secretKey}:`).toString('base64');
  const response = await fetch(
    'https://api.tosspayments.com/v1/payments/confirm',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `confirm:${params.orderNumber}:${params.paymentKey}`,
      },
      body: JSON.stringify({
        paymentKey: params.paymentKey,
        orderId: params.orderNumber,
        amount: params.amount,
      }),
    }
  );

  if (!response.ok) {
    let code = 'UNKNOWN';
    try {
      const body = (await response.json()) as { code?: string };
      if (body.code) code = body.code;
    } catch {
      // ignore parse failure
    }
    const mapped = TOSS_CONFIRM_ERROR_MAP[code];
    if (mapped) throw mapped();
    if (CARD_REJECTION_CODES.has(code)) {
      throw new AppError(ERROR_CODE.PAYMENT_CONFIRM_FAILED, 400);
    }
    throw new AppError(ERROR_CODE.PAYMENT_CONFIRM_FAILED, 500);
  }

  const data = (await response.json()) as {
    paymentKey: string;
    orderId: string;
    method: string;
    card?: { number?: string; installmentPlanMonths?: number };
    easyPay?: { provider?: string };
  };

  const method = TOSS_METHOD_MAP[data.method] ?? 'card';

  let methodDetail: string | null = null;
  if (method === 'easy_pay' && data.easyPay?.provider) {
    methodDetail = data.easyPay.provider;
  }

  return {
    providerPaymentKey: data.paymentKey,
    providerOrderId: data.orderId,
    method,
    methodDetail,
  };
}
