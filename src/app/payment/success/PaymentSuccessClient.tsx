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
    const amount = searchParams.get('amount');
    const isValidProvider =
      rawProvider !== null &&
      (PAYMENT_PROVIDERS as readonly string[]).includes(rawProvider);

    if (!orderNumber || !isValidProvider || !amount) {
      window.opener?.postMessage({ success: false }, window.location.origin);
      window.close();
      return;
    }

    const provider = rawProvider as PaymentProvider;

    paymentApi
      .confirmPayment({ provider, orderNumber, amount: Number(amount) })
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
