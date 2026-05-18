import { Suspense } from 'react';

import { PaymentFailContent } from '@/components/consumer/payment/PaymentFailContent';

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white px-6">
          <p
            role="status"
            aria-live="polite"
            className="text-sm font-medium text-gray-500"
          >
            결제 실패 정보를 확인하는 중입니다.
          </p>
        </main>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}
