'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { queryKeys } from '@/lib/queryKeys';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database';
import { useToastStore } from '@/stores/useToastStore';
import type { ToastType } from '@/stores/useToastStore';

type OrderRow = Database['public']['Tables']['orders']['Row'];

const STATUS_MESSAGES: Record<
  string,
  { message: string; type: ToastType } | undefined
> = {
  'reserved->accepted': { message: '주문이 접수되었습니다', type: 'success' },
  'accepted->ready': { message: '준비가 완료되었습니다', type: 'success' },
  'ready->completed': { message: '픽업이 완료되었습니다', type: 'info' },
};

export function useOrderStatusNotification(userId: string | null) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const receivedOrderUpdates = useRef(new Set<string>());
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`consumer-orders-${userId}`)
      .on<OrderRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newRecord = payload.new;
          const oldRecord = payload.old;
          const oldStatus = oldRecord.status;
          const newStatus = newRecord.status;

          if (!oldStatus || !newStatus) return;

          const dedupeKey = `${newRecord.id}-${newStatus}`;
          if (receivedOrderUpdates.current.has(dedupeKey)) return;
          receivedOrderUpdates.current.add(dedupeKey);

          void queryClient.invalidateQueries({
            queryKey: queryKeys.orders.lists(),
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.orders.details(),
          });

          const transition = `${oldStatus}->${newStatus}`;
          const toastConfig = STATUS_MESSAGES[transition];
          if (!toastConfig) return;
          if (pathnameRef.current.startsWith('/mypage/orders')) return;

          addToast(toastConfig);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, queryClient, addToast]);
}
