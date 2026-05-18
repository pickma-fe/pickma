'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

import { useConfirmPayment } from '@/hooks/payments/useConfirmPayment';

type ConfirmStatus = 'confirming' | 'success' | 'error';

interface PaymentQuery {
  paymentKey: string;
  orderNumber: string;
  amount: number;
}

function parsePaymentQuery(searchParams: URLSearchParams): PaymentQuery | null {
  const paymentKey = searchParams.get('paymentKey');
  const orderNumber = searchParams.get('orderId');
  const rawAmount = searchParams.get('amount');
  const amount = rawAmount === null ? Number.NaN : Number(rawAmount);

  if (!paymentKey || !orderNumber || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return { paymentKey, orderNumber, amount };
}

function notifyPaymentResult(message: {
  success: boolean;
  orderNumber?: string;
}) {
  window.opener?.postMessage(message, window.location.origin);
}

function closePopupIfOpened() {
  if (!window.opener) {
    return;
  }

  window.setTimeout(() => {
    window.close();
  }, 1200);
}

function getConfirmStatus(params: {
  hasPaymentQuery: boolean;
  isError: boolean;
  isSuccess: boolean;
}): ConfirmStatus {
  if (!params.hasPaymentQuery || params.isError) {
    return 'error';
  }

  if (params.isSuccess) {
    return 'success';
  }

  return 'confirming';
}

function getStatusIconClass(status: ConfirmStatus) {
  if (status === 'success') {
    return 'bg-primary-50 text-primary-500';
  }

  if (status === 'error') {
    return 'bg-red-50 text-red-500';
  }

  return 'bg-gray-50 text-gray-500';
}

function getStatusIcon(status: ConfirmStatus) {
  if (status === 'success') {
    return '✓';
  }

  if (status === 'error') {
    return '!';
  }

  return '…';
}

export function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const hasConfirmedRef = useRef(false);
  const paymentQuery = useMemo(
    () => parsePaymentQuery(searchParams),
    [searchParams]
  );
  const {
    isError,
    isSuccess,
    mutateAsync: confirmPayment,
  } = useConfirmPayment();

  useEffect(() => {
    if (hasConfirmedRef.current) {
      return;
    }

    hasConfirmedRef.current = true;

    if (!paymentQuery) {
      notifyPaymentResult({ success: false });
      closePopupIfOpened();
      return;
    }

    void confirmPayment(paymentQuery)
      .then(() => {
        notifyPaymentResult({
          success: true,
          orderNumber: paymentQuery.orderNumber,
        });
        closePopupIfOpened();
      })
      .catch(() => {
        notifyPaymentResult({ success: false });
      });
  }, [confirmPayment, paymentQuery]);

  const status = getConfirmStatus({
    hasPaymentQuery: Boolean(paymentQuery),
    isError,
    isSuccess,
  });
  const isProcessing = status === 'confirming';

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <section className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
        <div
          className={[
            'mx-auto flex size-14 items-center justify-center rounded-full text-2xl font-black',
            getStatusIconClass(status),
          ].join(' ')}
          aria-hidden="true"
        >
          {getStatusIcon(status)}
        </div>

        {isProcessing ? (
          <div role="status" aria-live="polite">
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              결제 승인 중입니다
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              결제 정보를 확인하고 있어요. 잠시만 기다려 주세요.
            </p>
          </div>
        ) : null}

        {status === 'success' ? (
          <div role="status" aria-live="polite">
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              결제가 완료되었습니다
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              예약이 정상적으로 확정되었습니다.
              {paymentQuery
                ? ` 주문번호는 ${paymentQuery.orderNumber}입니다.`
                : ''}
            </p>
          </div>
        ) : null}

        {status === 'error' ? (
          <div role="alert">
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              결제 승인에 실패했습니다
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              결제 정보가 올바르지 않거나 일시적인 문제가 발생했습니다.
              주문/결제 화면에서 다시 시도해 주세요.
            </p>
          </div>
        ) : null}

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
