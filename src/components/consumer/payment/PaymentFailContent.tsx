'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function notifyPaymentFail() {
  window.opener?.postMessage({ success: false }, window.location.origin);
}

function closePopupIfOpened() {
  if (!window.opener) {
    return;
  }

  window.setTimeout(() => {
    window.close();
  }, 2500);
}

export function PaymentFailContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code');
  const message = searchParams.get('message');
  const orderNumber = searchParams.get('orderId');

  useEffect(() => {
    notifyPaymentFail();
    closePopupIfOpened();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <section className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
        <div
          className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-2xl font-black text-red-500"
          aria-hidden="true"
        >
          !
        </div>

        <div role="alert">
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            결제를 완료하지 못했습니다
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            {message ?? '결제가 취소되었거나 일시적인 문제가 발생했습니다.'}
          </p>
        </div>

        <dl className="mt-6 space-y-2 rounded-md bg-gray-50 px-4 py-4 text-left text-sm">
          {orderNumber ? (
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-gray-500">주문번호</dt>
              <dd className="font-semibold text-gray-900">{orderNumber}</dd>
            </div>
          ) : null}
          {errorCode ? (
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-gray-500">오류 코드</dt>
              <dd className="font-semibold text-gray-900">{errorCode}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-gray-300 px-4 py-2 font-medium text-gray-900 transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            홈으로
          </Link>
          <Link
            href="/mypage"
            className="bg-primary-500 hover:bg-primary-600 inline-flex items-center justify-center rounded-sm border border-transparent px-4 py-2 font-medium text-white transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            내 예약 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
