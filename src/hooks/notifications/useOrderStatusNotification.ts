'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { queryKeys } from '@/lib/queryKeys';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database';
import { useToastStore } from '@/stores/useToastStore';

import { resolveConsumerOrderToast } from './notification-utils';

type OrderRow = Database['public']['Tables']['orders']['Row'];

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

          const dedupeKey = `${newRecord.id}-${newStatus}`;
          if (receivedOrderUpdates.current.has(dedupeKey)) return;
          receivedOrderUpdates.current.add(dedupeKey);

          void queryClient.invalidateQueries({
            queryKey: queryKeys.orders.lists(),
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.orders.details(),
          });

          const toastConfig = resolveConsumerOrderToast(
            oldStatus,
            newStatus,
            pathnameRef.current
          );
          if (toastConfig) addToast(toastConfig);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, queryClient, addToast]);
}
