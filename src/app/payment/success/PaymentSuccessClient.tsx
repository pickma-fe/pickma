'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { paymentApi } from '@/api/payments/paymentApi';

export function PaymentSuccessClient() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const rawAmount = searchParams.get('amount');
    const parsedAmount = rawAmount === null ? Number.NaN : Number(rawAmount);

    if (
      !paymentKey ||
      !orderId ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      window.opener?.postMessage({ success: false }, window.location.origin);
      window.close();
      return;
    }

    paymentApi
      .confirmPayment({
        paymentKey,
        orderNumber: orderId,
        amount: parsedAmount,
      })
      .then(() => {
        window.opener?.postMessage(
          { success: true, orderNumber: orderId },
          window.location.origin
        );
      })
      .catch(() => {
        window.opener?.postMessage({ success: false }, window.location.origin);
      })
      .finally(() => {
        window.close();
      });
  }, [searchParams]);

  return null;
}
