import { Suspense } from 'react';

import { TossCheckoutContent } from '@/components/consumer/payment/TossCheckoutContent';

export default function TossCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white px-6">
          <p
            role="status"
            aria-live="polite"
            className="text-sm font-medium text-gray-500"
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
