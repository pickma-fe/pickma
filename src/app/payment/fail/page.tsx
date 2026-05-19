'use client';

import { useEffect } from 'react';

export default function PaymentFailPage() {
  useEffect(() => {
    window.opener?.postMessage({ success: false }, window.location.origin);
    const timer = setTimeout(() => {
      window.close();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">결제가 취소되었습니다</p>
    </div>
  );
}
