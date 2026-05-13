'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import type { PaymentProvider } from '@/types/payment';
import { paymentApi } from '@/api/payments/paymentApi';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderNumber = searchParams.get('orderNumber');
    const provider = searchParams.get('provider') as PaymentProvider | null;
    const amount = searchParams.get('amount');

    if (!orderNumber || !provider || !amount) {
      window.opener?.postMessage({ success: false }, window.location.origin);
      window.close();
      return;
    }

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
