'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { invalidateTargets } from '@/lib/queryKeys';
import { paymentApi } from '@/api/payments/paymentApi';

export function usePayment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const inFlightRef = useRef(false);

  async function openPayment({
    orderNumber,
    orderName,
  }: {
    orderNumber: string;
    orderName: string;
  }): Promise<{ orderNumber: string }> {
    if (inFlightRef.current) throw new Error('payment_in_progress');
    inFlightRef.current = true;
    setIsPending(true);
    setError(null);
    try {
      const { redirectUrl } = await paymentApi.preparePayment({
        orderNumber,
        orderName,
      });

      const w = 800,
        h = 800;
      const left = Math.round((screen.width - w) / 2);
      const top = Math.round((screen.height - h) / 2);
      const popup = window.open(
        redirectUrl,
        '_blank',
        `width=${w},height=${h},left=${left},top=${top}`
      );
      if (!popup) throw new Error('팝업이 차단되었습니다');

      return await new Promise((resolve, reject) => {
        const handler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.source !== popup) return;
          cleanup();
          if (event.data?.success === true) {
            const msgOrderNumber = (event.data as { orderNumber?: unknown })
              .orderNumber;
            if (
              typeof msgOrderNumber !== 'string' ||
              msgOrderNumber !== orderNumber
            ) {
              router.push('/order/fail?reason=payment_failed');
              reject(new Error('payment_failed'));
              return;
            }
            invalidateTargets.afterPaymentSuccess.forEach((queryKey) => {
              void queryClient.invalidateQueries({ queryKey });
            });
            router.push(
              `/order/complete?orderNumber=${encodeURIComponent(msgOrderNumber)}`
            );
            resolve({ orderNumber: msgOrderNumber });
          } else {
            const data: unknown = event.data;
            const reason =
              data !== null &&
              typeof data === 'object' &&
              'reason' in data &&
              data.reason === 'payment_cancelled'
                ? 'payment_cancelled'
                : 'payment_failed';
            router.push(`/order/fail?reason=${reason}`);
            reject(new Error(reason));
          }
        };

        const timer = setInterval(() => {
          if (popup.closed) {
            cleanup();
            router.push('/order/fail?reason=payment_cancelled');
            reject(new Error('payment_cancelled'));
          }
        }, 500);

        function cleanup() {
          clearInterval(timer);
          window.removeEventListener('message', handler);
        }

        window.addEventListener('message', handler);
      });
    } catch (e) {
      const err = e instanceof Error ? e : new Error('payment_error');
      setError(err);
      throw err;
    } finally {
      inFlightRef.current = false;
      setIsPending(false);
    }
  }

  return { openPayment, isPending, error };
}
