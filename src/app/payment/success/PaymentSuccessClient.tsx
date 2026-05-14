'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import type { PaymentProvider } from '@/types/payment';
import { PAYMENT_PROVIDERS } from '@/types/payment';
import { paymentApi } from '@/api/payments/paymentApi';

export function PaymentSuccessClient() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderNumber = searchParams.get('orderNumber');
    const rawProvider = searchParams.get('provider');
    const rawAmount = searchParams.get('amount');
    const parsedAmount = rawAmount === null ? Number.NaN : Number(rawAmount);
    const isValidProvider =
      rawProvider !== null &&
      (PAYMENT_PROVIDERS as readonly string[]).includes(rawProvider);

    if (
      !orderNumber ||
      !isValidProvider ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      window.opener?.postMessage({ success: false }, window.location.origin);
      window.close();
      return;
    }

    const provider = rawProvider as PaymentProvider;

    paymentApi
      .confirmPayment({ provider, orderNumber, amount: parsedAmount })
      .then(() => {
        window.opener?.postMessage(
          { success: true, orderNumber },
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
