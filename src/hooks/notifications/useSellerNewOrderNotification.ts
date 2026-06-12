'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { queryKeys } from '@/lib/queryKeys';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database';
import { useToastStore } from '@/stores/useToastStore';

type OrderRow = Database['public']['Tables']['orders']['Row'];

export function useSellerNewOrderNotification(storeId: string | null) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const receivedOrderIds = useRef(new Set<string>());

  useEffect(() => {
    if (!storeId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`seller-orders-${storeId}`)
      .on<OrderRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const newOrder = payload.new;
          const oldOrder = payload.old;

          if (newOrder.status !== 'reserved' || oldOrder.status === 'reserved')
            return;

          if (receivedOrderIds.current.has(newOrder.id)) return;
          receivedOrderIds.current.add(newOrder.id);

          addToast({ message: '새 주문이 접수되었습니다', type: 'success' });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.sellers.orders.all(),
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [storeId, queryClient, addToast]);
}
