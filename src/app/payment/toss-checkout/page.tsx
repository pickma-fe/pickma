'use client';

import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function TossCheckoutPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderNumber = searchParams.get('orderNumber');
    const rawAmount = searchParams.get('amount');
    const orderName = searchParams.get('orderName');
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!orderNumber || !rawAmount || !orderName || !clientKey) {
      window.opener?.postMessage({ success: false }, window.location.origin);
      window.close();
      return;
    }

    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      window.opener?.postMessage({ success: false }, window.location.origin);
      window.close();
      return;
    }

    void loadTossPayments(clientKey)
      .then((tossPayments) =>
        tossPayments.payment({ customerKey: ANONYMOUS }).requestPayment({
          method: 'CARD',
          amount: { currency: 'KRW', value: amount },
          orderId: orderNumber,
          orderName,
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/payment/fail`,
        })
      )
      .catch(() => {
        window.opener?.postMessage({ success: false }, window.location.origin);
        window.close();
      });
  }, [searchParams]);

  return null;
}
