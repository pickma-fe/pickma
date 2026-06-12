'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { queryKeys } from '@/lib/queryKeys';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database';
import { useToastStore } from '@/stores/useToastStore';

type PaymentEventRow = Database['public']['Tables']['payment_events']['Row'];

export function useSellerNewOrderNotification(storeId: string | null) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const receivedEventIds = useRef(new Set<string>());

  useEffect(() => {
    if (!storeId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`seller-orders-${storeId}`)
      .on<PaymentEventRow>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payment_events',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const event = payload.new;
          if (receivedEventIds.current.has(event.id)) return;
          receivedEventIds.current.add(event.id);

          if (event.event_type === 'payment_confirmed') {
            addToast({ message: '새 주문이 접수되었습니다', type: 'success' });
            void queryClient.invalidateQueries({
              queryKey: queryKeys.sellers.orders.all(),
            });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [storeId, queryClient, addToast]);
}
