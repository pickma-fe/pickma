import { Suspense } from 'react';

import { PendingContent } from '@/components/seller/pending/PendingContent';

function PendingFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-gray-400">불러오는 중...</p>
    </div>
  );
}

export default function SellerPendingPage() {
  return (
    <Suspense fallback={<PendingFallback />}>
      <PendingContent />
    </Suspense>
  );
}
