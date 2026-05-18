'use client';

import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function notifyPaymentFailAndClose() {
  window.opener?.postMessage({ success: false }, window.location.origin);
  window.close();
}

export function TossCheckoutContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderNumber = searchParams.get('orderNumber');
    const rawAmount = searchParams.get('amount');
    const orderName = searchParams.get('orderName');
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!orderNumber || !rawAmount || !orderName || !clientKey) {
      notifyPaymentFailAndClose();
      return;
    }

    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      notifyPaymentFailAndClose();
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
        notifyPaymentFailAndClose();
      });
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <p
        role="status"
        aria-live="polite"
        className="text-sm font-medium text-gray-500"
      >
        결제창을 여는 중입니다.
      </p>
    </main>
  );
}
