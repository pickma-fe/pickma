'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useConfirmPayment } from '@/hooks/payments/useConfirmPayment';

export function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const { mutateAsync } = useConfirmPayment();
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

    mutateAsync({ paymentKey, orderNumber: orderId, amount: parsedAmount })
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
  }, [searchParams, mutateAsync]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <p
        role="status"
        aria-live="polite"
        className="text-lg font-medium text-gray-500"
      >
        결제를 처리하는 중입니다.
      </p>
    </main>
  );
}
