import { Suspense } from 'react';

import { PaymentSuccessContent } from '@/components/consumer/payment/PaymentSuccessContent';

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white px-6">
          <p
            role="status"
            aria-live="polite"
            className="text-sm font-medium text-gray-500"
          >
            결제 결과를 확인하는 중입니다.
          </p>
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
