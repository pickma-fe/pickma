'use client';

import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function TossCheckoutContent() {
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <p
        role="status"
        aria-live="polite"
        className="text-lg font-medium text-gray-500"
      >
        결제창을 여는 중입니다.
      </p>
    </main>
  );
}

export default function TossCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white px-6">
          <p
            role="status"
            aria-live="polite"
            className="text-lg font-medium text-gray-500"
          >
            결제창을 준비하는 중입니다.
          </p>
        </main>
      }
    >
      <TossCheckoutContent />
    </Suspense>
  );
}
