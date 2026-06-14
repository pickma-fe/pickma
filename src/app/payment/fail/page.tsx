'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const message =
    code === 'PAY_PROCESS_CANCELED'
      ? '결제가 취소되었습니다'
      : '결제에 실패했습니다. 잠시 후 다시 시도해 주세요.';

  useEffect(() => {
    const reason =
      code === 'PAY_PROCESS_CANCELED' ? 'payment_cancelled' : 'payment_failed';
    window.opener?.postMessage(
      { success: false, reason },
      window.location.origin
    );
    const timer = setTimeout(() => {
      window.close();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p
        role="status"
        aria-live="polite"
        className="text-lg font-medium text-gray-500"
      >
        {message}
      </p>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p
            role="status"
            aria-live="polite"
            className="text-lg font-medium text-gray-500"
          >
            결제가 취소되었습니다
          </p>
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}
