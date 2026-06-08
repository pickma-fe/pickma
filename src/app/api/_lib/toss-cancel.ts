import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';

export async function callTossCancel(params: {
  orderNumber: string;
  paymentKey: string;
  cancelReason: string;
  cancelAmount: number;
}): Promise<void> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const credentials = Buffer.from(`${secretKey}:`).toString('base64');
  let response: Response;
  try {
    response = await fetch(
      `https://api.tosspayments.com/v1/payments/${params.paymentKey}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `cancel:${params.orderNumber}:${params.paymentKey}`,
        },
        body: JSON.stringify({
          cancelReason: params.cancelReason,
          cancelAmount: params.cancelAmount,
        }),
        signal: AbortSignal.timeout(10_000),
      }
    );
  } catch (e) {
    if (e instanceof DOMException && e.name === 'TimeoutError') {
      throw new AppError(
        ERROR_CODE.PAYMENT_CANCEL_FAILED,
        500,
        'Toss cancel timeout'
      );
    }
    throw e;
  }

  if (!response.ok) {
    throw new AppError(ERROR_CODE.PAYMENT_CANCEL_FAILED, 500);
  }
}
