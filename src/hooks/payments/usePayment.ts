'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { paymentApi } from '@/api/payments/paymentApi';

export function usePayment() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function openPayment({
    orderNumber,
    orderName,
  }: {
    orderNumber: string;
    orderName: string;
  }): Promise<{ orderNumber: string }> {
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
            void queryClient.invalidateQueries({ queryKey: ['orders'] });
            resolve({
              orderNumber: (event.data as { orderNumber: string }).orderNumber,
            });
          } else {
            reject(new Error('payment_failed'));
          }
        };

        const timer = setInterval(() => {
          if (popup.closed) {
            cleanup();
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
      setIsPending(false);
    }
  }

  return { openPayment, isPending, error };
}
